# National Scale Ranking System

## Overview
The `NationalRankingEngine` replaces basic sorting with enterprise-grade percentile architectures capable of processing millions of records dynamically.

## Ranking Tiers
1. **All India Rank (AIR)**: The global rank across all participants.
2. **State Rank**: Filtered by candidate's registered state.
3. **Category Rank**: Filtered by reservation/category status.
4. **Subject Rank**: Granular ranks per exam section (e.g., Quant AIR).

## Dynamic Percentile Architecture
Percentile Formula:
`P = (Number of candidates with score <= candidate score) / Total Candidates * 100`
The engine calculates this continuously in Redis via Sorted Sets (`ZREVRANK`), projecting final percentiles live as new tests are submitted.
