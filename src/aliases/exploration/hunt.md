# Hunt

`!hunt <creature> [-p party_size] [bonuses]`

Runs a Survival check to find a creature trail. Successful hunts include the combat init suggestion and, when configured, monster art from the catalogue.

Location behavior is controlled by `subsystems.exploration.config.hunt_location_policy`:
`off` lets players hunt any resolved catalogue creature, `location` requires the current location to expose `commands.hunt`, and `monsters` also requires that the creature is listed in `location.huntable_monsters`.

Use `-p <party_size>` for group hunts. Bare numeric arguments are treated as part of the creature search, not as party size.

Running `!hunt` without a creature asks for a creature name and points players to `!hunt help`.

Creature names use the shared lookup behavior: no matches, exactly one match, or a request to be more specific with matched names.
