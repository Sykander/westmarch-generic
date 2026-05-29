const prodSourceMap = require('./sourcemap.prod.json');
const devSourceMap = require('./sourcemap.dev.json');

console.log(
  '❓ Checking Production Sourcemap includes everything from Development Sourcemap',
);
const { aliases, snippets, gvars, workshop } = {
  aliases: [],
  snippets: [],
  gvars: [],
  workshop: {},
  ...devSourceMap,
};
const {
  aliases: prodAliases,
  snippets: prodSnippets,
  gvars: prodGvars,
  workshop: prodWorkshop,
} = { aliases: [], snippets: [], gvars: [], workshop: {}, ...prodSourceMap };

console.log('❓ WORKSHOP CHECK');
const { environment, id } = workshop
const { environment: prodEnvironment, id: prodId } = prodWorkshop

const idIsValid = (typeof id === "string" && id.length === 24) || id === undefined
const prodIdIsValid = (typeof prodId === "string" && prodId.length === 24) || prodId === undefined

const environmentIsValid = (typeof environment === "string" && environment.length === 36) || environment === undefined
const prodEnvironmentIsValid = (typeof prodEnvironment === "string" && prodEnvironment.length === 36) || prodEnvironment === undefined

const idsMatch = id === prodId && id !== undefined
const environmentsMatch = environment === prodEnvironment && environment !== undefined

const missingProdEnvironment = prodEnvironment === undefined && environment !== undefined
const missingDevEnvironment = prodEnvironment !== undefined && environment === undefined
const missingProdId = prodId === undefined && id !== undefined
const missingDevId = prodId !== undefined && id === undefined

const missingProdEnvironmentGvar = prodEnvironment !== undefined && !prodGvars.some(({ name, id: tid }) => name === "env" && tid === prodEnvironment)
const missingDevEnvironmentGvar = environment !== undefined && !gvars.some(({ name, id: tid }) => name === "env" && tid === environment)

const passedWorkshopCheck = idIsValid
  && prodIdIsValid
  && environmentIsValid
  && prodEnvironmentIsValid
  && !idsMatch
  && !environmentsMatch
  && !missingProdEnvironment
  && !missingDevEnvironment
  && !missingProdId
  && !missingDevId
  && !missingProdEnvironmentGvar
  && !missingDevEnvironmentGvar

if (!passedWorkshopCheck) {
  if (!idIsValid) {
    console.log('❌ Development workshop.id is invalid');
  }
  
  if (!prodIdIsValid) {
    console.log('❌ Production workshop.id is invalid');
  }
  
  if (!environmentIsValid) {
    console.log('❌ Development workshop.environment is invalid');
  }
  
  if (!prodEnvironmentIsValid) {
    console.log('❌ Production workshop.environment is invalid');
  }

  if (idsMatch) {
      console.log('❌ Production and Development have the same workshop.id');
  }

  if (environmentsMatch) {
      console.log('❌ Production and Development have the same workshop.environment');
  }

  if (missingProdEnvironment) {
      console.log('❌ Production is missing workshop.environment');
  }

  if (missingDevEnvironment) {
      console.log('❌ Development is missing workshop.environment');
  }

  if (missingProdId) {
      console.log('❌ Production is missing workshop.id');
  }

  if (missingDevId) {
      console.log('❌ Development is missing workshop.id');
  }

  if (missingProdEnvironmentGvar) {
      console.log('❌ Production has workshop.environment but does not define a gvar in workshop.gvars for env with matching environment id');
  }

  if (missingDevEnvironmentGvar) {
      console.log('❌ Development has workshop.environment but does not define a gvar in workshop.gvars for env with matching environment id');
  }

  console.log('❌ WORKSHOP CHECK FAILED');
  process.exit(1);
}

console.log('✅ WORKSHOP CHECK PASSED');

console.log('❓ ALIASES CHECK');


const compareSubAliases = (devSubAliases, prodSubAliases) =>
  devSubAliases.every((devSubAlias) => {
    const prodSubAlias = prodSubAliases.find(
      ({ name }) => devSubAlias.name === name,
    );

    if (!prodSubAlias) {
      console.log(
        `❌ ${devSubAlias.name} SUB ALIAS doesn't have a matching sub alias in production.`,
      );
      return false;
    }

    if (devSubAlias.file !== prodSubAlias.file) {
      console.log(
        `❌ ${devSubAlias.name} SUB ALIAS has a different file in production.`,
      );
      return false;
    }

    if (devSubAlias.sub_aliases) {
      if (!prodSubAlias.sub_aliases) {
        console.log(
          `❌ ${devSubAlias.name} SUB ALIAS has sub aliases in dev but not production`,
        );
        return false;
      }

      const subAliasesMatch = compareSubAliases(
        devSubAlias.sub_aliases,
        prodSubAlias.sub_aliases,
      );

      if (!subAliasesMatch) {
        console.log(
          `❌ ${devSubAlias.name} SUB ALIAS has different sub aliases in production`,
        );
        return false;
      }
    }

    return true;
  });

const aliasesMatch = aliases.every((devAlias) => {
  const prodAlias = prodAliases.find(({ name }) => devAlias.name === name);

  if (!prodAlias) {
    console.log(
      `❌ ${devAlias.name} ALIAS doesn't have a matching alias in production`,
    );
    return false;
  }

  // Check files match
  if (devAlias.file !== prodAlias.file) {
    console.log(`❌ ${devAlias.name} ALIAS has a different file in production`);
    return false;
  }

  // check sub aliases match
  if (devAlias.sub_aliases) {
    if (!prodAlias.sub_aliases) {
      console.log(
        `❌ ${devAlias.name} ALIAS has sub aliases in development but not production`,
      );
      return false;
    }

    const subAliasesMatch = compareSubAliases(
      devAlias.sub_aliases,
      prodAlias.sub_aliases,
    );

    if (!subAliasesMatch) {
      console.log(
        `❌ ${devAlias.name} ALIAS sub aliases don't match in production`,
      );
      return false;
    }
  }

  return true;
});

if (!aliasesMatch) {
  console.log('❌ ALIASES CHECK FAILED');
  process.exit(1);
}

console.log('✅ ALIASES CHECK PASSED');

console.log('❓ SNIPPETS CHECK');

const snippetsMatch = snippets.every((devSnippet) => {
  const prodSnippet = prodSnippets.find(({ name }) => devSnippet.name === name);

  if (!prodSnippet) {
    console.log(
      `❌ ${devSnippet.name} SNIPPET doesn't have a matching snippet in production`,
    );
    return false;
  }

  // Check files match
  if (devSnippet.file !== prodSnippet.file) {
    console.log(
      `❌ ${devSnippet.name} SNIPPET has a different file in production`,
    );
    return false;
  }

  return true;
});

if (!snippetsMatch) {
  console.log('❌ SNIPPETS CHECK FAILED');
  process.exit(1);
}

console.log('✅ SNIPPETS CHECK PASSED');

console.log('❓ GVARS CHECK');

const matchesInProd = prodGvars.filter(
  ({ id }, index, src) =>
    index != src.findIndex(({ id: testId }) => testId === id),
);

if (matchesInProd.length) {
  console.log(
    `❌ Multiple GVARS have ID ${matchesInProd[0].id} in Production.`,
  );
  process.exit(1);
}

const gvarsMatch = gvars.every((devGvar) => {
  const prodGvar = prodGvars.find(({ name }) => devGvar.name === name);

  const matchesIdInDev = gvars.filter(({ id }) => id === devGvar.id);

  if (matchesIdInDev.length > 1) {
    console.log(
      `❌ ${devGvar.name} GVAR and ${matchesIdInDev[1].name} GVAR IDs are the same in Development`,
    );
    return false;
  }

  if (!prodGvar) {
    console.log(
      `❌ ${devGvar.name} GVAR doesn't have a matching gvar in production`,
    );
    return false;
  }

  if (devGvar.id === prodGvar.id) {
    console.log(`❌ ${devGvar.name} GVAR has the same ID in production`);
    return false;
  }

  // Check files match - exclude env file as these shouldn't match
  if (devGvar.file !== prodGvar.file && devGvar.name !== 'env') {
    console.log(`❌ ${devGvar.name} GVAR has a different file in production`);
    return false;
  }

  return true;
});

if (!gvarsMatch) {
  console.log('❌ GVARS CHECK FAILED');
  process.exit(1);
}

console.log('✅ GVARS CHECK PASSED');

console.log('✅ Development and Production sourcemaps match');
