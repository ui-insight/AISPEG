# Environment definition session — RCDS-provided VM

**Date:** 2026-08-06
**Answers:** Luke Sheneman (RCDS)
**Questions:** Barrie Robison / agent, from the definitional-pass template
**Distilled into:** [`lib/deployment-targets.ts`](../../lib/deployment-targets.ts) (`rcds-vm` profile)

Answers are verbatim. The prior repo-inferred characterization this
session superseded had three material errors: it modeled the service as
a self-managed VM (it is a managed container-hosting service — RCDS
holds root exclusively), it claimed MindRouter/DGX network adjacency as
a property (it is not one), and it invented a vague data ceiling (the
real rule is exposure-dependent and crisp).

---

## Identity

**1. What exactly does RCDS provide — the VM only, or VM plus patching/backups/monitoring? Where does RCDS's responsibility end and the builder's begin (who has root, who owns the OS)?**

> RCDS can provide virtual machine (VM) and/or container hosting in
> various flavors. What I think you are mainly describing here is our
> VM + container solution where we provide individuals with dedicated
> VMs for deploying their containerized, usually agentically-developed
> apps.
>
> RCDS provisions the VM, has root (only RCDS has root or sudo), and is
> responsible for OS patching, backups, and monitoring. RCDS owns the
> OS layer, the host firewall, upstream firewall, and the reverse proxy
> layer. RCDS manages the DNS and certificates as well.
>
> The user has non-root, non-sudo access to the VM, but the ability to
> deploy and manage docker containers (i.e., member of the docker
> group).

**2. What's the RCDS–IIDS relationship here: who requests a VM from whom, and is this a service any unit/researcher can get, or effectively IIDS-only?**

> Somebody requests a VM from Luke Sheneman (RCDS), and I review and
> approve the request. Any unit/researcher can request a VM. There is
> no formal request process, but there is usually a discussion about
> what is allowable and whether the VM will be internal only or also
> external facing.

**3. Is insight.uidaho.edu one VM hosting all those apps, or one VM per app? What hardware does this actually run on?**

> insight.uidaho.edu is a subdomain, and we can allocate multiple VMs to
> use \<host\>.insight.uidaho.edu. Sometimes we use
> \<host\>.nkn.uidaho.edu or other subdomains as well. We typically
> provision one VM per person, and they can host multiple apps on that
> VM.
>
> To date, these VMs run on Dell M640 servers hosted within a Dell VRTX
> server chassis managed by RCDS in the UI Library basement. Each M640
> has 1TB of RAM, and 28 CPU cores, SSD and NFS storage.

## Technical characteristics

**4. Network posture: public internet, campus firewall, or both by configuration? Who issues DNS and SSL? Is Azure AD SSO available?**

> Some VMs are public-facing, some are internal-only. It depends on the
> user's needs and use case. Typically, we configure each VM to be
> either internal or external. If a user needs one app to be
> internal-only and one to be external, we would configure the VM to be
> external and then use web server rules to enforce per-app external
> availability.
>
> These VMs currently sit behind a Watchguard firewall appliance, not
> the campus border firewall (Palo Alto). The Watchguard firewall is
> managed by RCDS and generally only does stateless packet filtering.
> If needed, we can move the VMs behind the campus Palo Alto firewall
> fairly easily.
>
> Luke Sheneman (RCDS) does DNS management, firewall management,
> requests and issues the SSL certificates. Luke can also work with OIT
> and the developer to get Azure AD SSO setup on an app-by-app case.

**5. AI adjacency: are these VMs on the same network fabric as MindRouter and the DGX hardware — is low-latency access to on-prem inference a real property?**

> While the VMs are running within the same chassis as MindRouter, I
> think it's best to consider this as the VMs call MindRouter over the
> campus network like anyone else.
>
> AI network traffic is so tiny (little textual prompts and
> completions), and all the real latency is in the inference itself (at
> the GPU), that network latency and throughput to these VMs is never
> the bottleneck.
>
> All requests from these VMs to MindRouter must traverse the Palo Alto
> border firewall like everything else.

**6. Sizing and lifecycle: typical/maximum VM specs, and is there any snapshot/backup/DR story at all?**

> Typically 4 or 8 vCPU cores, 16GB RAM, 256GB disk, 10Gbps networking.
> We can snapshot and backup to NFS backup. We're not currently
> off-siting those backups for DR.

## Requirements and rules

**7. What does it take to get one — approval by whom, any cost or chargeback, and what turnaround?**

> User talks to Luke, Luke approves/denies based on vibe, no cost,
> turnaround dependent on Luke's backlog. From hours to days.

**8. The real data rule: what data classification is actually permitted (or practiced) on these VMs today?**

> For external-facing apps: Low Risk data. For internal-only: Low to
> moderate risk.
>
> RCDS (Luke) doesn't continually audit user apps to ensure compliance
> with data classification guidance into the future. Up to the user.
> Luke can disable the VM at any time.

## Value proposition

**9. What does an RCDS VM offer that no other environment does? Is there a class of work for which this is the permanent right home, or is everything here transitional?**

> There is nothing special about RCDS VMs for this purpose. It is
> serving an immediate unmet need. If OIT provided a fast, free way for
> people to host their apps, RCDS would not need to do this.
>
> RCDS is Research Computing, VMs like this were primarily intended for
> supporting the University's research mission. Providing VMs for
> non-research use is only because UI folks don't have another fast,
> cost-free alternative. There is the perception that if we don't
> provide it, people will simply host apps externally wherever and
> we'll lose track of where our institutional data is being scattered
> and hosted across the internet.
>
> Ideally, OIT would have a very simple hosting environment, allowing
> fast deployment of agentically-developed apps for all users who need
> it.

**10. Anti-fit: what should never be on an RCDS VM?**

> RCDS infrastructure is never intended for high-risk data and
> Public-facing apps/VMs hosted at RCDS should only have LOW risk data.

## Open after this session

- **Q11 (per-app mapping corrections) was not answered** — which of the
  ten workloads currently mapped to this environment are mismapped is
  deferred to the full remapping pass after all five environments are
  defined.
- The session created a new open question, recorded on the profile:
  which current external-facing tenants exceed the Low-risk rule? No
  per-tenant classification review against the exposure rule has been
  done.
