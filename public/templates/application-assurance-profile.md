# Application Assurance Profile

Status: Proposed working instrument — not yet University policy

## 1. System and decision

- System/service:
- Assessed version and environment:
- Business owner:
- Technical owner:
- Data Owner or Steward:
- Assessor:
- Assessment date:
- Decision supported: design approval / production approval / material change / reassessment

## 2. Assurance dimensions

For every dimension, record the facts, evidence, and highest triggered level. Do not average levels; the highest applicable trigger determines the minimum assurance level.

| Dimension | Facts and evidence | Level 1 | Level 2 trigger | Level 3 trigger | Result |
|---|---|---|---|---|---|
| Data classification | | Low or public only | Moderate-risk data or credentials | High-risk data or severe bulk exposure | |
| Protected actions | | No protected action | Protected action affecting another person, record, access, or money | High-consequence or bulk action | |
| Exposure/adversaries | | Limited, low-value exposure | Internet, external identity, vendor, or untrusted input | High-value public target or privileged surface | |
| Identity/privilege | | No accounts or ordinary low-risk access | Authentication, delegation, or service credentials | Institution-wide/security privilege or separation-of-duty override | |
| Scale/blast radius | | Small contained population | College/division, 500+ people/records, or multiple dependencies | Institution-wide, 10,000+ records, or critical-service cascade | |
| Availability/recovery | | Limited tolerable disruption | Material delay or outage tolerance under three business days | Critical service, irreversible deadline, safety impact, or outage tolerance under one day | |
| External obligation | | No special obligation | Contractual, grant, accessibility, or compliance obligation | Independent assurance, severe reporting, or material liability | |

## 3. Selected level

- Highest triggered level:
- Selected OWASP ASVS version: 5.0.0
- Selected level: 1 / 2 / 3
- Rationale:
- Any higher voluntary target:
- Any disputed trigger:

## 4. Required evidence

### Level 1

- Architecture/attack-surface sketch
- ASVS 5.0.0 Level 1 control results
- Dependency, vulnerability, and secret-scan results

### Level 2

- All Level 1 evidence
- Lightweight threat model
- ASVS 5.0.0 Level 2 control results
- Authorization and integration tests
- Finding dispositions

### Level 3

- All Level 2 evidence
- Detailed independently reviewed threat model
- ASVS 5.0.0 Level 3 control results
- Independent security assessment
- Residual-risk acceptance
- Recovery exercise

## 5. Review and approval

- Reviewer:
- Review result: accepted / changes required / exception required
- Conditions:
- Approval authority:
- Approval date:
- Next review date:
- Material-change triggers that require reassessment:
