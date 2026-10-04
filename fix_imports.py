with open('src/components/devkit/generators/EntityWorkbench.tsx', 'r') as f:
    content = f.read()

content = content.replace('../../../../', '../../../')
content = content.replace('a.toLowerCase()', '(a: string) => a.toLowerCase()')

with open('src/components/devkit/generators/EntityWorkbench.tsx', 'w') as f:
    f.write(content)

with open('src/components/devkit/generators/entity/HierarchyExplorerDrawer.tsx', 'r') as f:
    content2 = f.read()

content2 = content2.replace('(mOrIndex, i)', '(mOrIndex: any, i: number)')

with open('src/components/devkit/generators/entity/HierarchyExplorerDrawer.tsx', 'w') as f:
    f.write(content2)
