PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

◇ injected env (6) from .env // tip: ◈ secrets for agents [www.dotenvx.com]
Server running on http://localhost:3000
PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

◇ injected env (6) from .env // tip: ⌘ enable debugging { debug: true }
Server running on http://localhost:3000
16:33:26 [vite] (client) Pre-transform error: C:\Users\Gebruiker\Documents\GitHub\artificer\src\components\character\LevelUpOverlay.tsx: Unexpected token (240:1)

  238 |     const oldMaxHp = character.maxHp || character.hp || 10;
  239 |     const oldHp = character.hp || 10;
> 240 | <<<<<<< HEAD
      |  ^
  241 |     
  242 | =======
  243 |
  Plugin: vite:react-babel
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/character/LevelUpOverlay.tsx:240:1
  247|  
  248|      if (levelUpResult.hasASI) {
  249|        updateCharacterStats(character.id, tempStats);
     |                  ^
  250|      }
  251|  
PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

◇ injected env (6) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
Server running on http://localhost:3000
16:36:30 [vite] (client) Pre-transform error: C:\Users\Gebruiker\Documents\GitHub\artificer\src\components\character\LevelUpOverlay.tsx: Unexpected token (240:1)

  238 |     const oldMaxHp = character.maxHp || character.hp || 10;
  239 |     const oldHp = character.hp || 10;
> 240 | <<<<<<< HEAD
      |  ^
  241 |     
  242 | =======
  243 |
  Plugin: vite:react-babel
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/character/LevelUpOverlay.tsx:240:1
  247|  
  248|      if (levelUpResult.hasASI) {
  249|        updateCharacterStats(character.id, tempStats);
     |                  ^
  250|      }
  251|  
16:36:51 [vite] Internal server error: C:\Users\Gebruiker\Documents\GitHub\artificer\src\components\character\LevelUpOverlay.tsx: Unexpected token (240:1)

  238 |     const oldMaxHp = character.maxHp || character.hp || 10;
  239 |     const oldHp = character.hp || 10;
> 240 | <<<<<<< HEAD
      |  ^
  241 |     
  242 | =======
  243 |
  Plugin: vite:react-babel
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/character/LevelUpOverlay.tsx:240:1
  247|  
  248|      if (levelUpResult.hasASI) {
  249|        updateCharacterStats(character.id, tempStats);
     |                  ^
  250|      }
  251|  
      at toParseError (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parse-error.ts:95:45)
      at TypeScriptParserMixin.raise (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\tokenizer\index.ts:1504:19)
      at TypeScriptParserMixin.unexpected (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\tokenizer\index.ts:1544:16)
      at TypeScriptParserMixin.jsxParseIdentifier (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:278:14)
      at TypeScriptParserMixin.jsxParseNamespacedName (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:288:25)
      at TypeScriptParserMixin.jsxParseElementName (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:306:14)
      at TypeScriptParserMixin.jsxParseOpeningElementAt (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:429:24)
      at TypeScriptParserMixin.jsxParseElementAt (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:470:35)
      at TypeScriptParserMixin.jsxParseElement (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:559:19)
      at TypeScriptParserMixin.parseExprAtom (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:573:21)
      at TypeScriptParserMixin.parseExprSubscripts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:742:23)
      at TypeScriptParserMixin.parseUpdate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:721:21)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:683:23)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3893:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:417:14)
      at TypeScriptParserMixin.parseExprOps (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:429:23)
      at TypeScriptParserMixin.parseMaybeConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:384:23)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:301:21)
      at fn (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3745:23)
      at TypeScriptParserMixin.tryParse (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\util.ts:174:20)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3744:20)
      at TypeScriptParserMixin.parseExpressionBase (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:226:23)
      at callback (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:3192:16)
      at TypeScriptParserMixin.parseExpression (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:217:17)
      at TypeScriptParserMixin.parseStatementContent (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\statement.ts:688:23)
      at TypeScriptParserMixin.parseStatementContent (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3220:20)
      at TypeScriptParserMixin.parseStatementLike (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\statement.ts:482:17)
      at TypeScriptParserMixin.parseStatementListItem (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\statement.ts:431:17)
      at TypeScriptParserMixin.parseBlockOrModuleBlockBody (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\statement.ts:1444:16)
      at TypeScriptParserMixin.parseBlockBody (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\statement.ts:1417:10)
      at TypeScriptParserMixin.parseBlock (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\statement.ts:1385:10)
      at TypeScriptParserMixin.parseFunctionBody (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:2621:24)
      at TypeScriptParserMixin.parseArrowExpression (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:2562:10)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:1850:12)
      at TypeScriptParserMixin.parseExprAtom (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:1170:21)
      at TypeScriptParserMixin.parseExprAtom (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:583:22)
      at TypeScriptParserMixin.parseExprSubscripts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:742:23)
      at TypeScriptParserMixin.parseUpdate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:721:21)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:683:23)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3893:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:417:14)
      at TypeScriptParserMixin.parseExprOps (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:429:23)
      at TypeScriptParserMixin.parseMaybeConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:384:23)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3764:22)
      at callback (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:3192:16)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:256:17)
      at TypeScriptParserMixin.parseVar (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\statement.ts:1587:18)
16:36:57 [vite] (client) Pre-transform error: C:\Users\Gebruiker\Documents\GitHub\artificer\src\components\combat\CombatGrid.tsx: Unexpected token (366:1)

  364 |     const target = hoveredCell || draggedPos;
  365 |     if (!target) return null;
> 366 | <<<<<<< HEAD
      |  ^
  367 |     const activeTokenCoordinates = draggedMonsterId 
  368 | =======
  369 |     const activeTokenCoordinates = draggedMonsterId
  Plugin: vite:react-babel
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/combat/CombatGrid.tsx:366:1
  372|        : activeTokenPos;
  373|      return findPath(activeTokenCoordinates, target, grid, monsters, playerPos);
  374|    }, [activeTokenPos, hoveredCell, draggedPos, grid, monsters, draggedMonsterId, playerPos]);
     |                    ^
  375|  
  376|    const rulerDistance = useMemo(() => {
16:40:04 [vite] (client) page reload src/components/combat/Token.tsx
16:40:04 [vite] (client) page reload src/components/combat/TokenActionHUD.tsx
16:40:54 [vite] (client) Pre-transform error: C:\Users\Gebruiker\Documents\GitHub\artificer\src\components\combat\Token.tsx: Did not expect a type annotation here. (87:20)

  85 |                     ? "border-emerald-500 bg-emerald-900/80 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
  86 |                     : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
> 87 |                     : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
     |                     ^
  88 |             ),
  89 |         isTargeting && !isPlayer && "ring-4 ring-dragon-gold animate-pulse scale-110",
  90 |         isHovered && "scale-105 brightness-110"
  Plugin: vite:react-babel
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/combat/Token.tsx:87:20
  86 |                      : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
  87 |                      : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
  88 |              ),
     |             ^
  89 |          isTargeting && !isPlayer && "ring-4 ring-dragon-gold animate-pulse scale-110",
  90 |          isHovered && "scale-105 brightness-110"
16:41:03 [vite] Internal server error: C:\Users\Gebruiker\Documents\GitHub\artificer\src\components\combat\Token.tsx: Did not expect a type annotation here. (87:20)

  85 |                     ? "border-emerald-500 bg-emerald-900/80 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
  86 |                     : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
> 87 |                     : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
     |                     ^
  88 |             ),
  89 |         isTargeting && !isPlayer && "ring-4 ring-dragon-gold animate-pulse scale-110",
  90 |         isHovered && "scale-105 brightness-110"
  Plugin: vite:react-babel
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/combat/Token.tsx:87:20
  86 |                      : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
  87 |                      : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
  88 |              ),
     |             ^
  89 |          isTargeting && !isPlayer && "ring-4 ring-dragon-gold animate-pulse scale-110",
  90 |          isHovered && "scale-105 brightness-110"
      at toParseError (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parse-error.ts:95:45)
      at TypeScriptParserMixin.raise (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\tokenizer\index.ts:1504:19)
      at node (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:2627:16)
      at Array.forEach (<anonymous>)
      at TypeScriptParserMixin.tsCheckForInvalidTypeCasts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:2625:13)
      at TypeScriptParserMixin.toReferencedList (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:2641:12)
      at TypeScriptParserMixin.toReferencedListDeep (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\lval.ts:406:10)
      at TypeScriptParserMixin.toReferencedArguments (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:963:10)
      at TypeScriptParserMixin.parseCoverCallAndAsyncArrowHead (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:951:12)
      at TypeScriptParserMixin.parseSubscript (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:804:19)
      at TypeScriptParserMixin.parseSubscript (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:2809:20)
      at TypeScriptParserMixin.parseSubscripts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:763:19)
      at TypeScriptParserMixin.parseExprSubscripts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:748:17)
      at TypeScriptParserMixin.parseUpdate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:721:21)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:683:23)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3893:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:417:14)
      at TypeScriptParserMixin.parseExprOps (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:429:23)
      at TypeScriptParserMixin.parseMaybeConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:384:23)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3764:22)
      at TypeScriptParserMixin.parseConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:405:29)
      at TypeScriptParserMixin.parseConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3393:20)
      at TypeScriptParserMixin.parseMaybeConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:390:17)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3764:22)
      at callback (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:3197:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:256:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:3311:17)
      at TypeScriptParserMixin.parseExprListItem (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:2793:18)
      at TypeScriptParserMixin.parseCallExpressionArguments (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:1042:14)
      at TypeScriptParserMixin.parseCoverCallAndAsyncArrowHead (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:922:29)
      at TypeScriptParserMixin.parseSubscript (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:804:19)
      at TypeScriptParserMixin.parseSubscript (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:2809:20)
      at TypeScriptParserMixin.parseSubscripts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:763:19)
      at TypeScriptParserMixin.parseExprSubscripts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:748:17)
      at TypeScriptParserMixin.parseUpdate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:721:21)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:683:23)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3893:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:417:14)
      at TypeScriptParserMixin.parseExprOps (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:429:23)
      at TypeScriptParserMixin.parseMaybeConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:384:23)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3764:22)
      at TypeScriptParserMixin.parseExpressionBase (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:226:23)
      at callback (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:3197:12)
      at TypeScriptParserMixin.parseExpression (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:217:17)
      at TypeScriptParserMixin.jsxParseExpressionContainer (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:376:33)
16:45:24 [vite] Internal server error: C:\Users\Gebruiker\Documents\GitHub\artificer\src\components\combat\Token.tsx: Did not expect a type annotation here. (87:20)

  85 |                     ? "border-emerald-500 bg-emerald-900/80 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
  86 |                     : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
> 87 |                     : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
     |                     ^
  88 |             ),
  89 |         isTargeting && !isPlayer && "ring-4 ring-dragon-gold animate-pulse scale-110",
  90 |         isHovered && "scale-105 brightness-110"
  Plugin: vite:react-babel
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/combat/Token.tsx:87:20
  86 |                      : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
  87 |                      : "border-dragon-red bg-red-900/80 shadow-[0_0_15px_rgba(220,38,38,0.3)]")
  88 |              ),
     |             ^
  89 |          isTargeting && !isPlayer && "ring-4 ring-dragon-gold animate-pulse scale-110",
  90 |          isHovered && "scale-105 brightness-110"
      at toParseError (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parse-error.ts:95:45)
      at TypeScriptParserMixin.raise (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\tokenizer\index.ts:1504:19)
      at node (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:2627:16)
      at Array.forEach (<anonymous>)
      at TypeScriptParserMixin.tsCheckForInvalidTypeCasts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:2625:13)
      at TypeScriptParserMixin.toReferencedList (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:2641:12)
      at TypeScriptParserMixin.toReferencedListDeep (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\lval.ts:406:10)
      at TypeScriptParserMixin.toReferencedArguments (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:963:10)
      at TypeScriptParserMixin.parseCoverCallAndAsyncArrowHead (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:951:12)
      at TypeScriptParserMixin.parseSubscript (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:804:19)
      at TypeScriptParserMixin.parseSubscript (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:2809:20)
      at TypeScriptParserMixin.parseSubscripts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:763:19)
      at TypeScriptParserMixin.parseExprSubscripts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:748:17)
      at TypeScriptParserMixin.parseUpdate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:721:21)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:683:23)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3893:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:417:14)
      at TypeScriptParserMixin.parseExprOps (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:429:23)
      at TypeScriptParserMixin.parseMaybeConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:384:23)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3764:22)
      at TypeScriptParserMixin.parseConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:405:29)
      at TypeScriptParserMixin.parseConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3393:20)
      at TypeScriptParserMixin.parseMaybeConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:390:17)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3764:22)
      at callback (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:3197:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:256:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:3311:17)
      at TypeScriptParserMixin.parseExprListItem (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:2793:18)
      at TypeScriptParserMixin.parseCallExpressionArguments (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:1042:14)
      at TypeScriptParserMixin.parseCoverCallAndAsyncArrowHead (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:922:29)
      at TypeScriptParserMixin.parseSubscript (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:804:19)
      at TypeScriptParserMixin.parseSubscript (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:2809:20)
      at TypeScriptParserMixin.parseSubscripts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:763:19)
      at TypeScriptParserMixin.parseExprSubscripts (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:748:17)
      at TypeScriptParserMixin.parseUpdate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:721:21)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:683:23)
      at TypeScriptParserMixin.parseMaybeUnary (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3893:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:417:14)
      at TypeScriptParserMixin.parseExprOps (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:429:23)
      at TypeScriptParserMixin.parseMaybeConditional (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:384:23)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:3764:22)
      at TypeScriptParserMixin.parseExpressionBase (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:226:23)
      at callback (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:3197:12)
      at TypeScriptParserMixin.parseExpression (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:217:17)
      at TypeScriptParserMixin.jsxParseExpressionContainer (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:376:33) (x2)