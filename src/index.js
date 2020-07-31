const { types } = require("@babel/core");
const { parse, print, visit } = require("graphql/language");
const { isIdentifier, isImportSpecifier, isImportDefaultSpecifier } = types;

module.exports = function renameGqlOperationNames() {
  function replaceOperationName(path, nameMapping = {}) {
    const source = path.node.quasis.reduce((head, quasi) => {
      return head + quasi.value.raw;
    }, "");

    const gqlAst = parse(source);
    visit(gqlAst, {
      OperationDefinition: {
        enter(node) {
          const currentName = node.name.value;
          const newName = nameMapping[currentName];
          if (newName) {
            node.name.value = newName;
          }
        },
      },
    });
    return print(gqlAst);
  }

  return {
    name: "rename-gql-operations",
    visitor: {
      Program(programPath, state) {
        const tagNames = [];

        programPath.traverse({
          ImportDeclaration(path) {
            const pathValue = path.node.source.value;
            const gqlSpecifier = path.node.specifiers.find((specifier) => {
              if (isImportSpecifier(specifier)) {
                return specifier.local.name === "gql";
              }

              if (isImportDefaultSpecifier(specifier)) {
                return importSources.some((source) => {
                  return onlyMatchImportSuffix
                    ? pathValue.endsWith(source)
                    : pathValue === source;
                });
              }

              return null;
            });
            if (gqlSpecifier) {
              tagNames.push(gqlSpecifier.local.name);
            }
          },
          TaggedTemplateExpression(path) {
            if (
              tagNames.some((name) => isIdentifier(path.node.tag, { name }))
            ) {
              const body = replaceOperationName(
                path.get("quasi"),
                state.opts.nameMapping
              );
              const replaceElement = types.templateElement({ raw: body });
              path.get("quasi.quasis")[0].replaceWith(replaceElement);
            }
          },
        });
      },
    },
  };
};
