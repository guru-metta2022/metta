# Project Metta Roadmap

This roadmap separates the current prototype from future research directions. It is an exploration plan, not a delivery-date promise.

## Current foundation

Project Metta currently provides a human-facing reflection experience and an advisory decision interface. Its configured evaluators apply project-defined criteria inspired by the Five Precepts, and its response layer is prompted to communicate with warmth, loving-kindness (*mettā*), and compassion (*karuṇā*). Results are advisory; the calling application retains control of action.

The current repository does not contain a complete Tipiṭaka corpus, a comprehensive canonical knowledge graph, general anomaly monitoring, or a validated consequence-prediction system.

## Future directions

### 1. Define the canonical source scope

- Select an initial, bounded collection of passages relevant to the project’s stated principles.
- Record canon/collection, passage identifier, language, edition, translator, source URL, version, and applicable license for each item.
- Treat Pāli source text, translations, commentaries, and modern AI interpretations as distinct, linked records.
- Expand scope deliberately toward broader Tipiṭaka coverage only as sources, expertise, and review capacity permit.

A knowledge graph of the entire Tipiṭaka would be a substantial, multi-stage scholarly and technical undertaking. [Access to Insight](https://accesstoinsight.org/tipitaka/index.html) describes its online collection as a small fraction of the Pali Canon; source coverage and translation permissions must therefore be checked before claiming comprehensive coverage. [SuttaCentral’s licensing guidance](https://suttacentral.net/licensing?lang=en) distinguishes public-domain original texts from translations that may have separate terms and requests that its content not be used to create generative-AI datasets.

### 2. Make the graph explainable and resistant to silent changes

- Represent passages, translations, ethical principles, interpretations, and applications as separate node types.
- Add explicit relationships such as “source for,” “translation of,” “interpreted as,” and “applied to.”
- Preserve provenance, version history, hashes where appropriate, and a documented review record.
- Keep newly proposed material isolated until a transparent review process accepts it into the project’s reference set.
- Describe integrity measures as reducing the risk of unnoticed or unauthorized changes, not as making the foundation impossible to alter or compromise.

### 3. Explore ethical discernment as a research question

- Study how an AI system can recognize when a proposed action may conflict with commitments grounded in the Five Precepts.
- Ask the system to explain its reasoning in ordinary language, identify affected beings and interests, and say when evidence is insufficient.
- Explore how mettā and karuṇā can shape constructive alternatives and care for everyone affected.
- Preserve the distinction between the project’s aspiration for cultivated ethical understanding and the present model-mediated classification prototype.

### 4. Investigate possible consequences

- Prototype structured scenario analysis for direct and indirect effects, short- and longer-term possibilities, and uncertainty.
- Present results as plausible scenarios for human review, not certain forecasts.
- Compare system analyses with domain experts and affected communities before considering higher-stakes uses.

### 5. Establish evaluation and governance

- Create a documented evaluation set covering clear cases, ambiguous cases, adversarial wording, conflicting interests, and requests that should receive an uncertain result.
- Measure false positives, false negatives, calibration, consistency, source fidelity, and the usefulness of compassionate alternatives.
- Invite Buddhist textual expertise, AI safety researchers, and people affected by evaluated decisions to review the methods and findings.
- Publish limitations and negative results alongside successful examples.

## Public language

Describe Metta as an **ethical discernment and compassionate decision-support project**. Present the canonical knowledge graph, sustained ethical discernment, and consequence analysis as future research directions until they are implemented and evaluated.
