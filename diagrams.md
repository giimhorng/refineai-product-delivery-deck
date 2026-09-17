# RefineAI — Architecture and Workflow Diagrams

Canonical Mermaid source for the diagrams drawn on slides 6 and 9 of
[RefineAI-Discover-Hackathon-2026-Solution-Deck.pptx](RefineAI-Discover-Hackathon-2026-Solution-Deck.pptx).
Keep this file and [../../../scripts/buildSubmissionDeck.mjs](../../../scripts/buildSubmissionDeck.mjs) in step.

## 1. High-l evel architecture

Four layers and one rule: anything reproducible is code, anything needing judgement is a
prompt, and any procedure with refusals is a skill. Sixteen agents can analyse; exactly one
can write.

```mermaid
flowchart TD
    subgraph PEOPLE["PEOPLE · VS Code + GitHub Copilot Chat"]
        PO["Product Owner"]
        SM["Scrum Master"]
        EM["Engineering Manager"]
        QA["QA Lead"]
        DEV["Developer"]
    end

    subgraph REASONING["REASONING · 17 agents"]
        ORCH["Orchestrator<br/>holds no write tools"]
        A1["Epic Readiness"]
        A2["Story Architect"]
        A3["Manual Test Designer"]
        A4["Dependency &amp; Risk"]
        A5["Capacity &amp; Closure"]
        A6["+ 11 more specialists"]
        GATE["Change Approval Gate<br/>the only writer"]
    end

    subgraph SKILLS["SKILLS · 8 mandatory procedures"]
        S1["Evidence-grounded analysis"]
        S2["Change-approval gate"]
        S3["Capacity calculation"]
        S4["Definition of Done validation"]
        S5["Roster &amp; ownership resolution"]
        S6["Manual test design"]
        S7["Workflow orchestration"]
        S8["User input elicitation"]
    end

    subgraph ENGINE["DETERMINISTIC ENGINE · 367 tests · 0 runtime deps"]
        COORD["22-stage coordinator"]
        SCORE["Readiness grading &amp; scoring"]
        COV["Coverage matrix"]
        DEP["Dependency graph"]
        EST["Estimation &amp; capacity"]
        PROP["Proposal builder"]
        EXEC["Approval &amp; execution"]
        AUDIT["Append-only audit trail"]
        SCHEMA{{"Schema validation<br/>malformed output is rejected, not repaired"}}
    end

    subgraph PORTS["PORTS · 9 contracts"]
        P1["IssueTracker"]
        P2["ContextProvider"]
        P3["Roster"]
        P4["Calendar"]
        P5["Repository"]
        P6["Design"]
        P7["Transcript"]
        P8["Audit"]
        P9["Clock"]
    end

    subgraph ADAPTERS["ADAPTERS · swappable"]
        AD1["Jira + Confluence (MCP)"]
        AD2["GitHub (MCP / CLI)"]
        AD3["Figma (MCP)"]
        AD4["Teams (Graph + MSAL)"]
        AD5["Calendars (ICS)"]
        AD6["Roster (XLSX)"]
        AD7["Mock Jira + fixtures<br/>demo only"]
    end

    PEOPLE --> ORCH
    ORCH --> A1 & A2 & A3 & A4 & A5 & A6
    A1 & A2 & A3 & A4 & A5 & A6 --> SKILLS
    SKILLS --> ENGINE
    A2 -- "proposal, never a write" --> GATE
    GATE -- "approved items only" --> EXEC
    ENGINE --> PORTS
    PORTS --> ADAPTERS

    classDef writer fill:#FFC83D,stroke:#B45309,color:#08124F,font-weight:bold
    classDef guard fill:#E9F0FE,stroke:#2E6AF6,color:#08124F
    class GATE writer
    class SCHEMA guard
```

## 2. End-to-end workflow

One resumable run of 22 named stages. Every stage records `DONE`, `SKIPPED` with a reason, or
`FAILED`, so a stage that did not apply is never confused with one that was forgotten.

```mermaid
flowchart LR
    START([Prompt: refine RBOC-200683]) --> C

    subgraph C["COLLECT &amp; NORMALIZE · stages 1–7"]
        direction TB
        C1["RECEIVED"] --> C2["VALIDATING_REQUEST"] --> C3["COLLECTING_CONTEXT"]
        C3 --> C4["NORMALIZING_EVIDENCE"] --> C5["ANALYZING_REFINEMENT_READINESS"]
        C5 --> C6["DETECTING_CONFLICTS"] --> C7["ANALYZING_DEPENDENCIES"]
    end

    C --> G

    subgraph G["GENERATE &amp; TRACE · stages 8–16"]
        direction TB
        G1["GENERATING_STORIES"] --> G2["GENERATING_MANUAL_TEST_CASES *"]
        G2 --> G3["RECOMMENDING_AUTOMATION"] --> G4["BUILDING_COVERAGE_MATRIX"]
        G4 --> G5["RECOMMENDING_OWNERSHIP"] --> G6["RECOMMENDING_REPOSITORIES *"]
        G6 --> G7["RECOMMENDING_ESTIMATES"] --> G8["ASSESSING_RISK"] --> G9["PREPARING_PREVIEW"]
    end

    G --> GATE{{"stage 17 · AWAITING_APPROVAL<br/>the run stops here · 0 writes"}}

    GATE -- "no decision yet" --> PAUSE[["State persisted<br/>resume in a new session<br/>re-reads nothing"]]
    PAUSE -. "resume + source-drift check" .-> GATE
    GATE -- "not approved" --> STOP([Nothing is written<br/>the state is kept])
    GATE -- "approved items only" --> E

    subgraph E["EXECUTE &amp; VALIDATE · stages 18–22"]
        direction TB
        E1["EXECUTING_APPROVED_CHANGES<br/>create_issue · link_to_epic · add_comment"]
        E1 --> E2["VALIDATING_DELIVERY_READINESS"] --> E3["CALCULATING_DELIVERY_CONFIDENCE"]
        E3 --> E4["GENERATING_FINAL_SUMMARY"] --> E5["COMPLETED"]
    end

    E --> OUT([Verdict · coverage matrix · audit trail])

    classDef gate fill:#FFC83D,stroke:#B45309,color:#08124F,font-weight:bold
    classDef halt fill:#EEF0F6,stroke:#5E6784,color:#172044
    class GATE gate
    class STOP,PAUSE halt
```

`*` optional stages — skipped with a recorded reason, never silently absent. In `DRAFT` and
`ANALYZE_ONLY` modes the gate itself is skipped with a recorded reason, because no write is
imminent.
