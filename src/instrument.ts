import * as ts from 'typescript';

import { applyReplacements, Replacement } from './replacement';

function visit(node: ts.Node, replacements: Replacement[], fileName: string) {
    if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node))) {
        for (const param of node.parameters) {
            if (!param.type && !param.initializer && node.body) {
                const params = [
                    JSON.stringify(param.name.getText()),
                    param.name.getText(),
                    param.name.getEnd(),
                    JSON.stringify(fileName),
                ];
                const instrumentExpr = `$at(${params.join(',')});`;
                replacements.push(Replacement.insert(node.body.getStart() + 1, instrumentExpr));
            }
        }
    }
    node.forEachChild((child) => visit(child, replacements, fileName));
}

export function instrument(source: string, fileName: string) {
    const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
    const replacements = [] as Replacement[];
    visit(sourceFile, replacements, fileName);
    return applyReplacements(source, replacements);
}