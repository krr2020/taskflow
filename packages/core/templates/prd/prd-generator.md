# PRD GENERATOR

Generate detailed Product Requirements Document (PRD) in Markdown format.

## Process

1. **Receive Initial Prompt:** The user provides a brief description or request for a new feature or functionality.
2. **Ask Clarifying Questions:** Before writing the PRD, the AI *must* ask only the most essential clarifying questions needed to write a clear PRD. Limit questions to 3-5 critical gaps in understanding. The goal is to understand the "what" and "why" of the feature, not necessarily the "how" (which the developer will figure out). Make sure to provide options in letter/number lists so I can respond easily with my selections.
3. **Generate PRD:** Based on the initial prompt and the user's answers to the clarifying questions, generate a PRD using the structure outlined below.
4. **Save PRD:** Save the generated document as `prd-[feature-name].md` inside the `/tasks` directory.

## Clarifying Questions (Guidelines)

Ask only the most critical questions needed to write a clear PRD. Focus on areas where the initial prompt is ambiguous or missing essential context. Common areas that may need clarification:

- **Problem/Goal:** If unclear - "What problem does this feature solve for the user?"
- **Core Functionality:** If vague - "What are the key actions a user should be able to perform?"
- **Scope/Boundaries:** If broad - "Are there any specific things this feature *should not* do?"
- **Success Criteria:** If unstated - "How will we know when this feature is successfully implemented?"

**Important:** Only ask questions when the answer isn't reasonably inferable from the initial prompt. Prioritize questions that would significantly impact the PRD's clarity.

### Formatting Requirements

- **Number all questions** (1, 2, 3, etc.)
- **List options for each question as A, B, C, D, etc.** for easy reference
- Make it simple for the user to respond with selections like "1A, 2C, 3B"

### Example Format

```
1. What is the primary goal of this feature?
   A. Improve user onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Generate additional revenue

2. Who is the target user for this feature?
   A. New users only
   B. Existing users only
   C. All users
   D. Admin users only

3. What is the expected timeline for this feature?
   A. Urgent (1-2 weeks)
   B. High priority (3-4 weeks)
   C. Standard (1-2 months)
   D. Future consideration (3+ months)
```

## PRD Structure

The generated PRD should include the following sections:

1. **Introduction/Overview:** Briefly describe the feature and the problem it solves. State the goal.
2. **Goals:** List the specific, measurable objectives for this feature.
3. **User Stories:** Detail the user narratives describing feature usage and benefits.
4. **Functional Requirements:** List the specific functionalities the feature must have. Use clear, concise language (e.g., "The system must allow users to upload a profile picture."). Number these requirements.
5. **Non-Goals (Out of Scope):** Clearly state what this feature will *not* include to manage scope.
6. **Design Considerations (Optional):** Link to mockups, describe UI/UX requirements, or mention relevant components/styles if applicable.
7. **Technical Considerations (Optional):** Mention any known technical constraints, dependencies, or suggestions (e.g., "Should integrate with the existing Auth module").
8. **Success Metrics:** How will the success of this feature be measured? (e.g., "Increase user engagement by 10%", "Reduce support tickets related to X").
9. **Open Questions:** List any remaining questions or areas needing further clarification.

## Requirements Syntax

**Use EARS syntax** for unambiguous acceptance criteria: WHEN [event] THEN [system] SHALL [response] | IF [precondition] THEN [system] SHALL [response].

## Alternative Analysis

When multiple approaches exist, present alternatives with pros/cons. Let user choose based on trade-offs.

## Success Metrics

Define measurable success criteria: quantitative metrics (response time, error rate, user engagement), qualitative metrics (user satisfaction, ease of use), performance targets (latency, throughput), acceptance criteria (specific benchmarks).

## Architecture Decisions

Document key architectural decisions: data model considerations, API contract considerations (endpoints, payloads, versioning), integration considerations (external services, webhooks), state management approach, caching strategy (if applicable).

## Testing Strategy

Define testing approach: unit tests (which components), integration tests (which flows), end-to-end tests (which user journeys), manual vs automated verification.

## Error Handling

Specify error scenarios: user input validation errors, API failure handling, timeout handling, retry logic (if applicable), error messages (user-friendly vs technical).

## Security & Performance

For each requirement, consider: security implications (authentication, authorization, data protection), performance impact (latency, throughput, scalability), rate limiting/throttling (if applicable).

## Library Compatibility

Before suggesting new libraries: verify no similar library exists, check compatibility with current stack, consider security/maintenance.

## Deployment Considerations

Define deployment requirements: database migrations (if applicable), feature flags (gradual rollout), rollback strategy, configuration changes required.

## Backward Compatibility

Define compatibility requirements: API versioning strategy, data migration needs, breaking changes documentation, deprecation timeline (if applicable).

## Monitoring & Observability

Define monitoring requirements: key metrics to track (performance, errors, usage), logging requirements (what to log, log levels), alerting thresholds, debugging capabilities.

## Documentation Requirements

Specify documentation needs: API documentation (endpoints, examples), user-facing documentation (guides, tutorials), internal documentation (architecture, design decisions), code comments requirements.

## Approval Gates & Definition of Done

**Explicit approval required**: Ask "yes/approved/LGTM?" before finalizing PRD content and moving to task breakdown.

**PRD complete when**: all sections filled (no TBD), requirements unambiguous (EARS syntax), success metrics measurable, architecture documented, security/performance addressed, testing defined, open questions documented.

## Output

**Format:** Markdown (`.md`) | **Location:** `/tasks/` | **Filename:** `prd-[feature-name].md`

## Target Audience

Assume the primary reader of the PRD is a **junior developer**. Therefore, requirements should be explicit, unambiguous, and avoid jargon where possible. Provide enough detail for them to understand the feature's purpose and core logic.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `prd-[feature-name].md`

## Final Instructions

1. Do NOT start implementing the PRD
2. Make sure to ask the user clarifying questions
3. Take the user's answers to the clarifying questions and improve the PRD
