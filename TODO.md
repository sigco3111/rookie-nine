# 루키나인 개발 메모 (비공개)
현재: 기본 골격(성장 루프 + 3D 타석). 완성품 아님. 마무리 여부는 사용자가 결정.
다음 작업
1. 타격 체감: 투구 궤적/존 시인성, 타구 카메라, 홈 구도, 구장 입체감
2. 홈 화면에서 캐릭터가 패널에 가리지 않는 구도
3. 성장 선택 결과 연결: 빌드별 특화, 특능 이벤트 (투수 육성/직접 투구는 v0.3에 기본 구현됨, 다듬기 필요)
4. 시나리오/이벤트 확장, 다회차(명예의 전당 선수 계승)
5. 후반 정밀검증: 밸런스(현재 너무 쉬움), 실기기, 예외 처리
원칙: 원작 코드/데이터/이름/대사 미사용, 구조만 참고. 공개 배포는 사용자 승인 후.

## 10:05 update
- Done: pitcher view camera/catcher/ump/backstop, position-specific home character, hit-flight in pitching, HoF inheritance, 8 new events (pos/trait/build specific), applyFx NaN guard for other-position stats.
- Next: batter hit camera + runner visual check, rival/scout scenario chains, crowd/stadium detail, more special-ability events. Late phase: balance (smart strategy top5 ~100%), device QA.
