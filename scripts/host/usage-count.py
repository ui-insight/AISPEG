#!/usr/bin/env python3.11
"""Daily usage counts for portfolio apps hosted on openera.insight.uidaho.edu.

Docker's json-file logs vanish whenever a container is recreated, so this
runs from cron and keeps one small file per UTC day:

    ~/usage/YYYY-MM-DD.json

Each file holds counts per portfolio slug and never an IP address, user
agent or path. scripts/collect-status-evidence.ts reads the files over ssh
and adds them to status-review packets.

    python3.11 ~/AISPEG/scripts/host/usage-count.py            # yesterday
    python3.11 ~/AISPEG/scripts/host/usage-count.py --days 90  # backfill

A finished day's counts never change, so once an app has counts for a day
they are kept unless --force is given; a later run cannot replace them
with "missing" after a redeploy. Apps recorded as missing are retried on
each run while the day is in the --days window. Cron runs it hourly with --days 2, so the first run
after UTC midnight records the day just ended:

    7 * * * * python3.11 $HOME/AISPEG/scripts/host/usage-count.py --days 2 >> $HOME/logs/usage-count.log 2>&1

Python 3.11 standard library only (the host default python3 is 3.6; there
is no Node).

Counting rules
- Source: the app's frontend nginx container, which sees every browser
  request. Lines from automated clients (this site's status-review probe,
  curl, wget, crawlers, health checks, loopback) are dropped.
- requests:  every remaining request.
- pageViews: successful GETs outside /api whose last path segment has no
  file extension (documents, not assets).
- apiCalls:  requests under /api.
- writes:    successful POST/PUT/PATCH/DELETE requests.
- visitors:  distinct (client IP, user agent) pairs for the day, counted
  in memory and discarded. The client IP is the first X-Forwarded-For
  address when nginx logs one. The Insight proxy can collapse many people
  into one address, so treat this as a floor, not a head count.
- coverage:  "full", or "partial" with coverageFrom when the oldest log
  line Docker holds falls inside the day (recreate or rotation), or
  "missing" when the log starts after the day or Docker could not read it.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone

# Portfolio slug -> frontend container. Keep slugs in step with
# lib/portfolio.ts. Add an app here when it starts serving real users.
TARGETS = {
    "stratplan": ("stratplan-prod-frontend", "combined"),
    "ucm-daily-register": ("ucmnews-prod-frontend-1", "method-only"),
    "processmapping": ("processmapping-frontend-1", "combined"),
    "openera": ("openera-dev-frontend-1", "combined"),
    "rfd-companion": ("rfd-companion-prod-frontend-prod-1", "combined"),
    "dissertation-formatter": ("dissertation-prod-web-1", "combined"),
    "governance-registry": ("governance-prod-frontend-1", "combined"),
}

OUT_DIR = os.path.expanduser(os.environ.get("USAGE_DIR", "~/usage"))

# `docker logs --timestamps` prefixes each line with an RFC 3339 time.
COMBINED = re.compile(
    r'^\S+ (?P<remote>\S+) \S+ \S+ \[[^\]]+\] "(?P<method>[A-Z]+) (?P<path>\S+)[^"]*" '
    r'(?P<status>\d{3}) \S+ "[^"]*" "(?P<ua>[^"]*)"(?: "(?P<xff>[^"]*)")?'
)
METHOD_ONLY = re.compile(r"^\S+ \S+ method=(?P<method>[A-Z]+) status=(?P<status>\d{3})")

AUTOMATED_UA = re.compile(
    r"aispeg-status-review|curl|wget|bot\b|crawler|spider|kube-probe|uptime|"
    r"monitor|python-requests|go-http-client|httpx|node-fetch|axios",
    re.I,
)
HEALTH_PATH = re.compile(r"^/(api/(v\d+/)?)?(health|healthz|ready|readyz|live|livez|ping)\b")
WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


def docker(*args):
    return subprocess.run(["docker", *args], capture_output=True, text=True)


def parse_ts(raw):
    # Docker prints nanoseconds; Python parses microseconds.
    raw = re.sub(r"(\.\d{6})\d*", r"\1", raw.strip()).replace("Z", "+00:00")
    return datetime.fromisoformat(raw)


def first_log_at(container):
    """Time of the oldest log line Docker still holds, or None.

    This, not .State.StartedAt, bounds coverage: a restart keeps the log, a
    recreate starts a new one, and rotation (max-size) drops the oldest part.
    """
    if docker("inspect", container).returncode != 0:
        return None
    p = subprocess.Popen(
        ["docker", "logs", "--timestamps", container],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    )
    line = p.stdout.readline()
    p.kill()
    p.wait()
    try:
        return parse_ts(line.split(" ", 1)[0]) if line else None
    except ValueError:
        return None


def count_day(container, fmt, day_start):
    day_end = day_start + timedelta(days=1)
    started = first_log_at(container)
    if started is None:
        return {"container": container, "coverage": "missing"}
    if started >= day_end:
        return {"container": container, "coverage": "missing", "logsFrom": started.isoformat()}

    r = docker(
        "logs", "--timestamps",
        "--since", day_start.isoformat(), "--until", day_end.isoformat(),
        container,
    )
    if r.returncode != 0:
        return {"container": container, "coverage": "missing", "error": "docker logs failed"}

    counts = {"requests": 0, "apiCalls": 0, "writes": 0, "errors5xx": 0}
    if fmt == "combined":
        counts["pageViews"] = 0
    clients = set()
    # nginx writes access lines to stdout and errors to stderr.
    for line in r.stdout.splitlines():
        if fmt == "combined":
            m = COMBINED.match(line)
            if not m:
                continue
            ua, path = m["ua"], m["path"].split("?", 1)[0]
            if m["remote"] in ("127.0.0.1", "::1") or AUTOMATED_UA.search(ua) or HEALTH_PATH.match(path):
                continue
            xff = (m["xff"] or "-").split(",")[0].strip()
            clients.add((xff if xff not in ("", "-") else m["remote"], ua))
        else:
            m = METHOD_ONLY.match(line)
            if not m or m["method"] == "HEAD":
                continue
            path = None
        method, status = m["method"], int(m["status"])
        counts["requests"] += 1
        if status >= 500:
            counts["errors5xx"] += 1
        if path is not None and path.startswith("/api"):
            counts["apiCalls"] += 1
        if method in WRITE_METHODS and status < 400:
            counts["writes"] += 1
        if (
            path is not None
            and method == "GET"
            and status < 400
            and not path.startswith("/api")
            and "." not in path.rsplit("/", 1)[-1]
        ):
            counts["pageViews"] += 1
    if fmt == "combined":
        counts["visitors"] = len(clients)
    else:
        del counts["apiCalls"]

    result = {"container": container, "format": fmt, **counts}
    if started > day_start:
        result["coverage"] = "partial"
        result["coverageFrom"] = started.isoformat()
    else:
        result["coverage"] = "full"
    return result


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n", 1)[0])
    ap.add_argument("--days", type=int, default=1, help="count this many days ending yesterday")
    ap.add_argument("--force", action="store_true", help="recount days that already have a file")
    args = ap.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    for back in range(args.days, 0, -1):
        day_start = today - timedelta(days=back)
        day = day_start.date().isoformat()
        path = os.path.join(OUT_DIR, f"{day}.json")
        apps = {}
        if os.path.exists(path) and not args.force:
            with open(path) as f:
                apps = json.load(f)["apps"]
        # Count apps the file lacks or recorded as missing (Docker may have
        # been down); keep counts already taken, since logs only shrink.
        todo = {
            slug: target for slug, target in TARGETS.items()
            if apps.get(slug, {}).get("coverage", "missing") == "missing"
        }
        if not todo:
            continue
        fresh = {slug: count_day(c, fmt, day_start) for slug, (c, fmt) in todo.items()}
        if apps and all(a["coverage"] == "missing" for a in fresh.values()):
            continue
        apps.update(fresh)
        record = {
            "day": day,
            "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "apps": apps,
        }
        with open(path + ".tmp", "w") as f:
            json.dump(record, f, indent=1)
        os.replace(path + ".tmp", path)
        summary = " ".join(
            f"{s}={a.get('requests', '-')}/{a['coverage'][0]}" for s, a in apps.items()
        )
        print(f"{record['generatedAt']} {day} {summary}")


if __name__ == "__main__":
    sys.exit(main())
