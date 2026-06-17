# Hunt

`!hunt <creature> [-p party_size] [bonuses]`

Runs a Survival check to find a creature trail. Successful hunts include the combat init suggestion and, when configured, monster art from the catalogue.

Use `-p <party_size>` for group hunts. Bare numeric arguments are treated as part of the creature search, not as party size.

Running `!hunt` without a creature asks for a creature name and points players to `!hunt help`.

Creature names use the shared lookup behavior: no matches, exactly one match, or a request to be more specific with matched names.
