exports.up = async function (knex) {
  const hasExperience = await knex.schema.hasColumn("leaders", "experience");
  if (!hasExperience) {
    await knex.schema.table("leaders", (table) => {
      table.text("experience").after("education");
    });
    console.log("✅ Added experience column");
  }

  const hasPositionRunningFor = await knex.schema.hasColumn(
    "leaders",
    "position_running_for",
  );
  if (!hasPositionRunningFor) {
    await knex.schema.table("leaders", (table) => {
      table.string("position_running_for", 100).after("position");
    });
    console.log("✅ Added position_running_for column");
  }

  const hasMotto = await knex.schema.hasColumn("leaders", "motto");
  if (!hasMotto) {
    await knex.schema.table("leaders", (table) => {
      table.string("motto", 500).after("slogan");
    });
    console.log("✅ Added motto column");
  }
};

exports.down = async function (knex) {
  await knex.schema.table("leaders", (table) => {
    table.dropColumn("experience");
    table.dropColumn("position_running_for");
    table.dropColumn("motto");
  });
};
