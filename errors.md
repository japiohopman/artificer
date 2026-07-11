[plugin:vite:react-babel] C:\Users\Gebruiker\Documents\GitHub\artificer\src\components\combat\Token.tsx: Did not expect a type annotation here. (130:14)
  133 |       </div>

C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/combat/Token.tsx:130:14

133|        </div>
134|        
135|        {/* Active Indicator */}
   |                            ^
136|        {isActive && (
137|          <motion.div

PS C:\Users\Gebruiker\Documents\GitHub\artificer> npm run dev

> react-example@0.0.0 dev
> tsx server.ts

◇ injected env (6) from .env // tip: ⌘ override existing { override: true }
Server running on http://localhost:3000
17:07:32 [vite] (client) Pre-transform error: C:\Users\Gebruiker\Documents\GitHub\artificer\src\components\combat\Token.tsx: Did not expect a type annotation here. (130:14)

  128 |               ? "bg-emerald-900/95 text-white border-emerald-400/50"
  129 |               : "bg-dragon-darkRed/95 text-white border-dragon-red/50")
> 130 |               : "bg-dragon-darkRed/95 text-white border-dragon-red/50")
      |               ^
  131 |       )}>
  132 |         {name}
  133 |       </div>
  Plugin: vite:react-babel
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/combat/Token.tsx:130:14
  133|        </div>
  134|        
  135|        {/* Active Indicator */}
     |                            ^
  136|        {isActive && (
  137|          <motion.div 
17:07:51 [vite] Internal server error: C:\Users\Gebruiker\Documents\GitHub\artificer\src\components\combat\Token.tsx: Did not expect a type annotation here. (130:14)

  128 |               ? "bg-emerald-900/95 text-white border-emerald-400/50"
  129 |               : "bg-dragon-darkRed/95 text-white border-dragon-red/50")
> 130 |               : "bg-dragon-darkRed/95 text-white border-dragon-red/50")
      |               ^
  131 |       )}>
  132 |         {name}
  133 |       </div>
  Plugin: vite:react-babel
  File: C:/Users/Gebruiker/Documents/GitHub/artificer/src/components/combat/Token.tsx:130:14
  133|        </div>
  134|        
  135|        {/* Active Indicator */}
     |                            ^
  136|        {isActive && (
  137|          <motion.div 
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
      at TypeScriptParserMixin.parseExpressionBase (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:226:23)
      at callback (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:3197:12)
      at TypeScriptParserMixin.parseExpression (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:217:17)
      at TypeScriptParserMixin.jsxParseExpressionContainer (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:376:33)
      at TypeScriptParserMixin.jsxParseAttributeValue (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:331:23)
      at TypeScriptParserMixin.jsxParseAttribute (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:414:43)
      at TypeScriptParserMixin.jsxParseOpeningElementAfterName (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:440:30)
      at TypeScriptParserMixin.jsxParseOpeningElementAfterName (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\typescript\index.ts:4215:20)
      at TypeScriptParserMixin.jsxParseOpeningElementAt (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:430:19)
      at TypeScriptParserMixin.jsxParseElementAt (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:470:35)
      at TypeScriptParserMixin.jsxParseElementAt (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\plugins\jsx\index.ts:483:34)
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
      at callback (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:3197:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:256:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (C:\Users\Gebruiker\Documents\GitHub\artificer\node_modules\@babel\parser\src\parser\expression.ts:3311:17)