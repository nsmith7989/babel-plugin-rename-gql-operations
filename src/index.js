const { parse, print, visit } = require("graphql/language");
const template = require("@babel/template").default;

module.exports = function renameGqlOperationNames({ types: t }) {
  const TemplateElementVisitor = {
    TemplateElement(templateElement) {
      const newValue = rename(templateElement.node.value.raw, this.nameMapping);
      // check to make sure it hasn't already been replaced
      // (or doesn't need to be replaced, removing this check causes an infinite loop)
      if (templateElement.node.value.raw !== newValue) {
        templateElement.replaceWith(
          t.templateElement({
            raw: newValue,
            cooked: newValue,
          })
        );
      }
    },
  };

  const ProgramVisitor = {
    ImportDeclaration(path) {
      const {
        importSources = ["graphql-tag", "@apollo/client"],
        onlyMatchImportSuffix = false,
      } = this.options;
      const pathValue = path.node.source.value;
      const gqlSpecifier = path.node.specifiers.find((specifier) => {
        if (t.isImportSpecifier(specifier)) {
          return specifier.local.name === "gql";
        }

        if (t.isImportDefaultSpecifier(specifier)) {
          return importSources.some((source) => {
            return onlyMatchImportSuffix
              ? pathValue.endsWith(source)
              : pathValue === source;
          });
        }

        return null;
      });
      if (gqlSpecifier) {
        this.tagNames.push(gqlSpecifier.local.name);
      }
    },
    TaggedTemplateExpression(path) {
      if (
        this.tagNames.some((name) => t.isIdentifier(path.node.tag, { name }))
      ) {
        path.traverse(TemplateElementVisitor, this);
      }
    },
  };

  return {
    name: "rename-gql-operations",
    visitor: {
      Program(programPath, state) {
        const tagNames = [];
        const nameMapping = state.opts.nameMapping;
        programPath.traverse(ProgramVisitor, {
          tagNames,
          nameMapping,
          options: state.opts,
        });
      },
    },
  };
};

function rename(string, nameMapping = {}) {
  const normalizedString = normalize(string);
  if (!normalizedString) {
    return string;
  }
  const gqlAst = parse(normalizedString);
  return print(
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
    })
  );
}

function normalize(string) {
  return string.replace(/(\r\n|\n|\r)/gm, "").trim();
}
