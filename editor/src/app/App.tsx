import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import westmarchPackage from '../../../package.json';
import {
  CheckCircle2,
  Clipboard,
  Compass,
  Download,
  ExternalLink,
  FileCode2,
  FileDown,
  FileText,
  Radio,
  Save,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  applyIssueFix,
  createBlankConfig,
  parseConfig,
  readPath,
  serializeConfig,
  updatePath,
  validateConfig,
} from '../lib/config';
import type { AnyRecord, ConfigIssue, ConfigModel } from '../lib/config';
import { fetchGvar, makeGvarDashboardUrl, normalizeGvarId, updateGvar } from '../lib/avrae';
import { AvraeTokenHelp } from '../components/AvraeTokenHelp';
import { HelpTip } from '../components/HelpTip';
import { JsonField } from '../components/JsonField';
import {
  ColourField,
  FooterBehaviourField,
  FooterTextListField,
  SectionTitle,
  SelectField,
  TextField,
} from '../components/FormFields';
import { IssueSummary, RunSteps, SectionCta, severityIcon } from '../components/WorkflowPanels';
import { PlannedFeatureButton } from '../components/PlannedFeature';
import { EncounterRowBuilder } from '../components/EncounterRowBuilder';
import {
  ENGINE_BIOMES,
  ENGINE_BIOME_NOTES,
  customGvarError,
  engineBiomeGvarId,
  formatBiomeName,
  normaliseBiomeCode,
  presetFromGvarId,
} from '../domain/biomes';
import { DISPLAY_OVERRIDE_HELP, monsterArtSelectValue } from '../domain/display';
import { SUBSYSTEM_DEFINITIONS } from '../domain/subsystems';
import type { CompactEncounterRow } from '../domain/encounters';
import { asRecord } from '../lib/records';
import { SECTIONS, sectionFor, type Section } from './sections';
import type { RunStep, SubsystemDefinition } from './types';

const BRAND_LOGO_URL = `${import.meta.env.BASE_URL}westmarch-assets/brand/logo.png`;
const WESTMARCH_VERSION = westmarchPackage.version;

const STARTER_SNIPPET = `subsystems = {
    "exploration": {
        "enabled": False,
        "commands": {"enc": False, "forage": False, "fish": False, "mine": False, "lumber": False, "hunt": False, "loot": False},
        "config": {
            "enc_biome_source": "auto",
            "distribution_policy": "random",
            "distribution": {"combat": 25, "quest": 25, "gather": 50},
            "repeat_exclude_window": 5,
            "monster_images": {"hunt": "thumbnail", "loot": "thumbnail"},
            "show_check_dcs": {"hunt": True, "loot": True},
        },
    }
}

world_data = {
    "biomes": {},
    "locations": {},
    "paths": [],
}

policies = {
    "exploration": {"enforce_cooldowns": True, "avoid_repeat_encounters": "off"},
    "display": {"footer_behaviour": "balanced", "command_thumbnail": "default", "helpful_tips": [], "credits": None},
    "player_setup": {
        "enabled": True,
        "require_character": True,
        "hud": {"enabled": True, "fields": ["coins", "wallet", "location", "time", "weather"]},
        "checks": [],
    },
}
`;

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getInitialConfigId() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('westmarch_config') ?? '';
  if (!value) return '';
  try {
    return normalizeGvarId(value);
  } catch {
    return value;
  }
}

function makeShareLink(configId: string) {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  try {
    const gvarId = normalizeGvarId(configId);
    if (gvarId) url.searchParams.set('westmarch_config', gvarId);
  } catch {
    // Invalid ids cannot produce useful share links.
  }
  return url.toString();
}

function focusNextCta() {
  window.setTimeout(() => {
    document.querySelector<HTMLButtonElement>('[data-next-cta]')?.focus();
  }, 0);
}

export function App() {
  const [section, setSection] = useState<Section>('setup');
  const [configId, setConfigId] = useState(getInitialConfigId);
  const [token, setToken] = useState('');
  const [rawSource, setRawSource] = useState('');
  const [config, setConfig] = useState<ConfigModel | null>(null);
  const [rawMode, setRawMode] = useState(false);
  const [status, setStatus] = useState('No config loaded');
  const [steps, setSteps] = useState<RunStep[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const parsed = useMemo(() => parseConfig(rawSource), [rawSource]);

  useEffect(() => {
    if (parsed.model) setConfig(parsed.model);
  }, [parsed.model]);

  const issues = useMemo(() => validateConfig(config, parsed.issues), [config, parsed.issues]);

  const serialized = useMemo(
    () => (config ? serializeConfig(config) : rawSource),
    [config, rawSource],
  );

  const errorCount = issues.filter((item) => item.severity === 'error').length;
  const warningCount = issues.filter((item) => item.severity === 'warning').length;
  const canMovePastSetup = Boolean(config || rawSource.trim());

  function updateConfig(path: string, value: unknown) {
    setConfig((current) => (current ? updatePath(current, path, value) : current));
  }

  async function loadFromAvrae() {
    let gvarId = '';
    try {
      gvarId = normalizeGvarId(configId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid gvar id.';
      setStatus(message);
      setSteps([{ label: 'Read gvar from Avrae', state: 'failed', detail: message }]);
      return;
    }
    if (!gvarId || !token.trim()) {
      setStatus('Config id and token are required to read from Avrae.');
      return;
    }
    setConfigId(gvarId);
    setIsBusy(true);
    setSteps([{ label: 'Read gvar from Avrae', state: 'running' }]);
    try {
      const gvar = await fetchGvar(gvarId, token.trim());
      setRawSource(String(gvar.value ?? ''));
      setStatus('Loaded from Avrae. Review the source, then use Next to continue.');
      setSteps([{ label: 'Read gvar from Avrae', state: 'success' }]);
      focusNextCta();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Avrae load failed');
      setSteps([
        {
          label: 'Read gvar from Avrae',
          state: 'failed',
          detail: error instanceof Error ? error.message : 'Unknown error',
        },
      ]);
    } finally {
      setIsBusy(false);
    }
  }

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setStatus(`${label} copied`);
  }

  async function publishToAvrae() {
    let gvarId = '';
    try {
      gvarId = normalizeGvarId(configId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid gvar id.';
      setStatus(message);
      setSteps([{ label: 'Publish to Avrae', state: 'failed', detail: message }]);
      return;
    }
    if (!gvarId || !token.trim()) {
      setStatus('Config id and token are required to publish.');
      return;
    }
    if (errorCount > 0) {
      setStatus('Fix blocking errors before publishing. Open Check to review them.');
      return;
    }
    setConfigId(gvarId);

    setIsBusy(true);
    const nextSteps: RunStep[] = [
      { label: 'Validate config', state: 'running' },
      { label: 'Serialize gvar body', state: 'pending' },
      { label: 'Publish to Avrae', state: 'pending' },
      { label: 'Verify remote body', state: 'pending' },
    ];
    setSteps([...nextSteps]);

    try {
      nextSteps[0] = {
        label: 'Validate config',
        state: warningCount > 0 ? 'warning' : 'success',
        detail: warningCount > 0 ? `${warningCount} warning(s)` : undefined,
      };
      nextSteps[1] = { label: 'Serialize gvar body', state: 'success' };
      nextSteps[2] = { label: 'Publish to Avrae', state: 'running' };
      setSteps([...nextSteps]);

      await updateGvar(gvarId, token.trim(), serialized);
      nextSteps[2] = { label: 'Publish to Avrae', state: 'success' };
      nextSteps[3] = { label: 'Verify remote body', state: 'running' };
      setSteps([...nextSteps]);

      const remote = await fetchGvar(gvarId, token.trim());
      const verified = String(remote.value ?? '') === serialized;
      nextSteps[3] = {
        label: 'Verify remote body',
        state: verified ? 'success' : 'warning',
        detail: verified ? undefined : 'Remote body did not exactly match export text.',
      };
      setSteps([...nextSteps]);
      setStatus(verified ? 'Publish complete' : 'Verify warning after publish');
    } catch (error) {
      const index = nextSteps.findIndex((item) => item.state === 'running');
      if (index >= 0) {
        nextSteps[index] = {
          ...nextSteps[index],
          state: 'failed',
          detail: error instanceof Error ? error.message : 'Unknown error',
        };
      }
      setSteps([...nextSteps]);
      setStatus(error instanceof Error ? error.message : 'Publish failed');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img className="brand-logo" src={BRAND_LOGO_URL} alt="" aria-hidden="true" />
          <div className="brand-copy">
            <h1>Westmarch Config Editor</h1>
            <span>Configuring Westmarch v{WESTMARCH_VERSION}</span>
          </div>
        </div>
        <div className="top-actions">
          <span className="status-text" role="status" aria-live="polite">
            {status}
          </span>
          <span className={errorCount ? 'badge danger' : 'badge ok'}>{errorCount} errors</span>
          <span className={warningCount ? 'badge warn' : 'badge ok'}>{warningCount} warnings</span>
          <button className="icon-button" type="button" onClick={() => setRawMode(!rawMode)}>
            <FileCode2 size={17} aria-hidden="true" />
            {rawMode ? 'Guided' : 'Raw'}
          </button>
        </div>
      </header>

      <div className="workspace">
        <nav className="sidebar" aria-label="Editor sections">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={section === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <main className="main-pane">
          {rawMode ? (
            <RawSourceView
              rawSource={rawSource}
              setRawSource={setRawSource}
              parsedMode={parsed.mode}
            />
          ) : (
            <>
              {section === 'setup' && (
                <SetupView
                  configId={configId}
                  setConfigId={setConfigId}
                  token={token}
                  setToken={setToken}
                  rawSource={rawSource}
                  setRawSource={setRawSource}
                  loadFromAvrae={loadFromAvrae}
                  isBusy={isBusy}
                  onBlank={() => {
                    const blank = createBlankConfig();
                    setConfig(blank);
                    setRawSource(serializeConfig(blank));
                    setStatus('Started new config. Use Next when you are ready to continue.');
                    focusNextCta();
                  }}
                  onStarter={() => {
                    setRawSource(STARTER_SNIPPET);
                    setStatus('Starter snippet loaded. Use Next when you are ready to continue.');
                    focusNextCta();
                  }}
                />
              )}
              {section === 'check' && (
                <CheckView
                  issues={issues}
                  setSection={setSection}
                  applyFix={(code) => {
                    if (config) setConfig(applyIssueFix(config, code));
                  }}
                />
              )}
              {section === 'display' && config && (
                <DisplayView config={config} updateConfig={updateConfig} />
              )}
              {section === 'subsystems' && config && (
                <SubsystemsView config={config} updateConfig={updateConfig} />
              )}
              {section === 'policies' && config && (
                <PoliciesView config={config} updateConfig={updateConfig} />
              )}
              {section === 'world' && config && (
                <WorldView config={config} updateConfig={updateConfig} />
              )}
              {section === 'biomes' && config && (
                <BiomesView config={config} updateConfig={updateConfig} />
              )}
              {section === 'encounters' && <EncountersView />}
              {section === 'export' && (
                <ExportView
                  serialized={serialized}
                  configId={configId}
                  shareLink={makeShareLink(configId)}
                  steps={steps}
                  publishToAvrae={publishToAvrae}
                  copy={copy}
                  canPublish={Boolean(config && configId.trim() && token.trim())}
                  isBusy={isBusy}
                />
              )}
              {!config && section !== 'setup' && section !== 'encounters' && (
                <EmptyState setSection={setSection} />
              )}
              <SectionCta
                section={section}
                setSection={setSection}
                canMovePastSetup={canMovePastSetup}
                errorCount={errorCount}
                canPublish={Boolean(config && configId.trim() && token.trim())}
                isBusy={isBusy}
                publishToAvrae={publishToAvrae}
              />
            </>
          )}
        </main>

        <aside className="right-pane">
          <IssueSummary issues={issues} setSection={setSection} />
          <RunSteps steps={steps} />
        </aside>
      </div>
    </div>
  );
}

function SetupView(props: {
  configId: string;
  setConfigId: (value: string) => void;
  token: string;
  setToken: (value: string) => void;
  rawSource: string;
  setRawSource: (value: string) => void;
  loadFromAvrae: () => void;
  isBusy: boolean;
  onBlank: () => void;
  onStarter: () => void;
}) {
  const gvarDashboardUrl = useMemo(() => makeGvarDashboardUrl(props.configId), [props.configId]);

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<UploadCloud size={20} />}
        title="Setup"
        help="Load with a token, paste a gvar body, or start from a small literal starter."
      />
      <div className="form-grid">
        <label className="field">
          <span>
            westmarch_config
            <HelpTip label="westmarch_config help">
              Use the bare config gvar UUID from your server svar. Pasting an editor share link is
              also okay; the editor will extract the UUID.
            </HelpTip>
          </span>
          <div className="field-with-action">
            <input
              value={props.configId}
              onChange={(event) => props.setConfigId(event.target.value)}
              placeholder="ffffffff-ffff-ffff-ffff-ffffffffffff"
            />
            <button
              type="button"
              className="field-action-button"
              onClick={() => {
                if (gvarDashboardUrl) {
                  window.open(gvarDashboardUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              disabled={!gvarDashboardUrl}
              title={
                gvarDashboardUrl
                  ? 'Open this gvar in the Avrae dashboard'
                  : 'Enter a valid gvar UUID to open it in Avrae'
              }
              aria-label="Open westmarch_config gvar in Avrae dashboard"
            >
              <ExternalLink size={16} aria-hidden="true" />
            </button>
          </div>
        </label>
        <label className="field">
          <span>
            AVRAE_TOKEN
            <AvraeTokenHelp />
          </span>
          <input
            type="password"
            value={props.token}
            onChange={(event) => props.setToken(event.target.value)}
            placeholder="Only needed for Avrae read/publish"
          />
        </label>
        <div className="button-row span-2">
          <button
            type="button"
            className="primary"
            onClick={props.loadFromAvrae}
            disabled={props.isBusy}
          >
            <UploadCloud size={16} aria-hidden="true" />
            Read From Avrae
          </button>
          <button type="button" onClick={props.onBlank}>
            <FileText size={16} aria-hidden="true" />
            New Config
          </button>
          <button type="button" onClick={props.onStarter}>
            <FileCode2 size={16} aria-hidden="true" />
            Starter Source
          </button>
        </div>
        <label className="field span-2">
          <span>
            Gvar source
            <HelpTip label="Gvar source help">
              Paste the current gvar body here when no token is available.
            </HelpTip>
          </span>
          <textarea
            className="code-input"
            rows={18}
            value={props.rawSource}
            onChange={(event) => props.setRawSource(event.target.value)}
            spellCheck={false}
          />
        </label>
      </div>
    </section>
  );
}

function CheckView(props: {
  issues: ConfigIssue[];
  setSection: (section: Section) => void;
  applyFix: (code: string) => void;
}) {
  return (
    <section className="section-panel">
      <SectionTitle
        icon={<CheckCircle2 size={20} />}
        title="Check"
        help="Browser checks are the source of truth for config validation and add field-level guidance."
      />
      <div className="issue-list full">
        {props.issues.length === 0 ? (
          <article className="issue info clean-check">
            <div className="issue-head">
              {severityIcon('info')}
              <div>
                <h3>No issues found</h3>
                <span>config</span>
              </div>
            </div>
            <p>The current browser checks did not find errors or warnings.</p>
            <div className="button-row">
              <button type="button" className="primary" onClick={() => props.setSection('export')}>
                <CheckCircle2 size={15} aria-hidden="true" />
                Continue To Export
              </button>
            </div>
          </article>
        ) : null}
        {props.issues.map((item) => (
          <article className={`issue ${item.severity}`} key={`${item.code}:${item.path}`}>
            <div className="issue-head">
              {severityIcon(item.severity)}
              <div>
                <h3>{item.title}</h3>
                <span>{item.path}</span>
              </div>
            </div>
            <p>{item.detail}</p>
            {item.fix ? <p className="fix">{item.fix}</p> : null}
            <div className="button-row">
              <button type="button" onClick={() => props.setSection(sectionFor(item.section))}>
                <Radio size={15} aria-hidden="true" />
                Go To Field
              </button>
              {item.canAutoFix ? (
                <button type="button" onClick={() => props.applyFix(item.code)}>
                  <Save size={15} aria-hidden="true" />
                  Apply Fix
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DisplayView({
  config,
  updateConfig,
}: {
  config: ConfigModel;
  updateConfig: (path: string, value: unknown) => void;
}) {
  const footerBehaviour = String(
    readPath(config, 'policies.display.footer_behaviour') ?? 'balanced',
  );
  const footerHelp =
    footerBehaviour === 'string'
      ? 'Policies is set to Fixed text, so command embeds pick from this list.'
      : footerBehaviour === 'balanced'
        ? 'Balanced mode may pick one of these fixed footer lines.'
        : 'Configured here for Fixed text or Balanced footer policies.';

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<FileText size={20} />}
        title="Display"
        help="Branding values are used by embeds and configuration summaries."
      />
      <div className="form-grid">
        <TextField
          label="World name"
          value={String(config.display.name ?? '')}
          onChange={(value) => updateConfig('display.name', value)}
          help="Shown in branded embeds and config summaries."
        />
        <label className="field">
          <span>
            Rules version
            <HelpTip label="Rules version help">
              Infer omits rules_version so Avrae server settings from !servsettings are used. Choose
              2014 or 2024 only when the config should override the server default.
            </HelpTip>
          </span>
          <select
            value={String(config.rules_version ?? '')}
            onChange={(event) => updateConfig('rules_version', event.target.value || undefined)}
          >
            <option value="">Infer from !servsettings</option>
            <option value="2014">2014</option>
            <option value="2024">2024</option>
          </select>
        </label>
        <ColourField
          label="Embed colour"
          value={String(config.display.colour ?? '')}
          onChange={(value) => updateConfig('display.colour', value)}
          help="Six hex digits, with or without a leading #. Clear the text box to omit display.colour from the config."
        />
        <TextField
          label="Logo / thumbnail"
          value={String(config.display.logo ?? '')}
          onChange={(value) => updateConfig('display.logo', value || undefined)}
          help="Overrides the default westmarch-generic GitHub Pages logo used as command embed thumbnails."
        />
        <SelectField
          label="Command thumbnail"
          value={String(readPath(config, 'policies.display.command_thumbnail') ?? 'default')}
          values={['default', 'character']}
          onChange={(value) => updateConfig('policies.display.command_thumbnail', value)}
          help="Default uses the configured logo. Character uses the selected character image when available."
        />
        <FooterTextListField
          label="Fixed footer texts"
          value={config.display.footer}
          onChange={(value) => updateConfig('display.footer', value)}
          help={footerHelp}
        />
        <label className="field span-2">
          <span>Description</span>
          <textarea
            value={String(config.display.description ?? '')}
            onChange={(event) => updateConfig('display.description', event.target.value)}
            rows={5}
          />
        </label>
      </div>
    </section>
  );
}

function SubsystemsView({
  config,
  updateConfig,
}: {
  config: ConfigModel;
  updateConfig: (path: string, value: unknown) => void;
}) {
  const [plannedSubsystem, setPlannedSubsystem] = useState<SubsystemDefinition | null>(null);
  const knownSubsystems = new Set(SUBSYSTEM_DEFINITIONS.map((item) => item.key));
  const subsystemRows: SubsystemDefinition[] = [
    ...SUBSYSTEM_DEFINITIONS,
    ...Object.keys(config.subsystems)
      .filter((key) => !knownSubsystems.has(key))
      .map((key) => ({
        key,
        label: key,
        commands: Object.keys(asRecord(asRecord(config.subsystems[key]).commands)),
        implemented: true,
        detail: 'Custom subsystem loaded from this config.',
      })),
  ];

  function openPlanned(definition: SubsystemDefinition) {
    setPlannedSubsystem(definition);
  }

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<Radio size={20} />}
        title="Subsystems"
        help="Subsystem and command toggles decide which command families are active for a server."
      />
      <div className="subsystem-list">
        {subsystemRows.map((definition) => {
          const key = definition.key;
          const block = config.subsystems[key] ?? {};
          const record = asRecord(block);
          const commands = asRecord(record.commands);
          const commandDisplay = asRecord(record.command_display);
          const commandEntries = definition.commands.length
            ? definition.commands.map((command) => [command, commands[command]] as const)
            : Object.entries(commands);
          const isPlanned = !definition.implemented;

          return (
            <div className={isPlanned ? 'subsystem-row planned' : 'subsystem-row'} key={key}>
              <div className="subsystem-head">
                {isPlanned ? (
                  <div className="switch-line">
                    <input type="checkbox" checked={record.enabled === true} disabled readOnly />
                    <span>{definition.label}</span>
                  </div>
                ) : (
                  <label className="switch-line">
                    <input
                      type="checkbox"
                      checked={record.enabled === true}
                      onChange={(event) =>
                        updateConfig(`subsystems.${key}.enabled`, event.target.checked)
                      }
                    />
                    <span>{definition.label}</span>
                  </label>
                )}
                {isPlanned ? (
                  <button
                    type="button"
                    className="badge neutral badge-button"
                    onClick={() => openPlanned(definition)}
                  >
                    Planned
                  </button>
                ) : null}
              </div>
              {isPlanned ? <p className="planned-summary">{definition.detail}</p> : null}
              {definition.dependencies?.length ? (
                <div className="dependency-list" aria-label={`${definition.label} dependencies`}>
                  {definition.dependencies.map((dependency) => (
                    <span
                      className={`dependency-pill ${dependency.level}`}
                      key={`${definition.key}:${dependency.label}`}
                    >
                      <strong>
                        {dependency.level === 'required' ? 'Requires' : 'Works with'}{' '}
                        {dependency.url ? (
                          <a href={dependency.url} target="_blank" rel="noreferrer">
                            {dependency.label}
                            <ExternalLink size={12} aria-hidden="true" />
                          </a>
                        ) : (
                          dependency.label
                        )}
                      </strong>
                      {dependency.detail}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="toggle-grid">
                {commandEntries.map(([command, value]) =>
                  isPlanned ? (
                    <span className="check-chip disabled" key={command}>
                      <input type="checkbox" checked={value === true} disabled readOnly />
                      <span>{command}</span>
                    </span>
                  ) : (
                    <label className="check-chip" key={command}>
                      <input
                        type="checkbox"
                        checked={value === true}
                        onChange={(event) =>
                          updateConfig(
                            `subsystems.${key}.commands.${command}`,
                            event.target.checked,
                          )
                        }
                      />
                      <span>{command}</span>
                    </label>
                  ),
                )}
              </div>
              <details className="subsystem-details">
                <summary>Display and advanced settings</summary>
                <div className="subsystem-detail-body">
                  <DisplayOverrideEditor
                    title="Subsystem display override"
                    path={`subsystems.${key}.display`}
                    value={asRecord(record.display)}
                    updateConfig={updateConfig}
                  />
                  <div className="command-override-list">
                    <h3>Command display overrides</h3>
                    {commandEntries.map(([command]) => (
                      <details className="command-override" key={command}>
                        <summary>{command}</summary>
                        <DisplayOverrideEditor
                          title={`${command} display override`}
                          path={`subsystems.${key}.command_display.${command}`}
                          value={asRecord(commandDisplay[command])}
                          updateConfig={updateConfig}
                        />
                      </details>
                    ))}
                  </div>
                  <div className="subsystem-json-grid">
                    <JsonField
                      label="Subsystem config JSON"
                      value={record.config ?? {}}
                      onCommit={(value) => updateConfig(`subsystems.${key}.config`, value)}
                      minRows={5}
                    />
                    <JsonField
                      label="Command config JSON"
                      value={record.command_config ?? {}}
                      onCommit={(value) => updateConfig(`subsystems.${key}.command_config`, value)}
                      minRows={5}
                    />
                  </div>
                </div>
              </details>
            </div>
          );
        })}
      </div>
      {plannedSubsystem ? (
        <PlannedSubsystemModal
          subsystem={plannedSubsystem}
          onClose={() => setPlannedSubsystem(null)}
        />
      ) : null}
    </section>
  );
}

function DisplayOverrideEditor({
  title,
  path,
  value,
  updateConfig,
}: {
  title: string;
  path: string;
  value: AnyRecord;
  updateConfig: (path: string, value: unknown) => void;
}) {
  return (
    <section className="display-override">
      <div className="display-override-head">
        <h3>{title}</h3>
        <HelpTip label={`${title} help`}>{DISPLAY_OVERRIDE_HELP}</HelpTip>
      </div>
      <div className="form-grid compact">
        <TextField
          label="Title"
          value={String(value.title ?? '')}
          onChange={(next) => updateConfig(`${path}.title`, next || undefined)}
          help="Overrides the embed title for this subsystem or command."
        />
        <ColourField
          label="Colour"
          value={String(value.colour ?? '')}
          onChange={(next) => updateConfig(`${path}.colour`, next)}
          help="Overrides the inherited embed accent colour."
        />
        <TextField
          label="Image"
          value={String(value.image ?? '')}
          onChange={(next) => updateConfig(`${path}.image`, next || undefined)}
          help="Wide banner image URL."
        />
        <TextField
          label="Logo"
          value={String(value.logo ?? '')}
          onChange={(next) => updateConfig(`${path}.logo`, next || undefined)}
          help="Small thumbnail or icon URL."
        />
        <FooterTextListField
          label="Footer"
          value={value.footer}
          onChange={(next) => updateConfig(`${path}.footer`, next || undefined)}
          help="Overrides inherited fixed footer text. Multiple rows rotate when fixed text is selected."
        />
        <label className="field span-2">
          <span>
            Description
            <HelpTip label={`${title} description help`}>
              Overrides the inherited short embed description for this layer.
            </HelpTip>
          </span>
          <textarea
            value={String(value.description ?? '')}
            onChange={(event) =>
              updateConfig(`${path}.description`, event.target.value || undefined)
            }
            rows={3}
          />
        </label>
      </div>
    </section>
  );
}

function PlannedSubsystemModal({
  subsystem,
  onClose,
}: {
  subsystem: SubsystemDefinition;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="modal-header">
          <div className="modal-heading">
            <span className="modal-icon" aria-hidden="true">
              <Radio size={22} />
            </span>
            <div>
              <h2 id={titleId}>{subsystem.label} is not implemented yet</h2>
              <p id={descriptionId}>{subsystem.detail}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            className="icon-only"
            type="button"
            aria-label="Close planned subsystem notice"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="modal-body">
          <p>
            The editor includes this subsystem in new configs as disabled so the shape is visible,
            but guided editing is locked until the feature is ready.
          </p>
          <p>
            Planned commands: <strong>{subsystem.commands.join(', ')}</strong>
          </p>
          <p>Existing hand-authored values can still be inspected or adjusted in Raw mode.</p>
          <div className="modal-actions">
            <button className="primary" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function PoliciesView({
  config,
  updateConfig,
}: {
  config: ConfigModel;
  updateConfig: (path: string, value: unknown) => void;
}) {
  return (
    <section className="section-panel">
      <SectionTitle
        icon={<Save size={20} />}
        title="Policies"
        help="Policies tune command behavior without changing engine code."
      />
      <div className="form-grid">
        <SelectField
          label="Encounter biome source"
          value={String(
            readPath(config, 'subsystems.exploration.config.enc_biome_source') ?? 'auto',
          )}
          values={['auto', 'argument', 'location']}
          onChange={(value) =>
            updateConfig('subsystems.exploration.config.enc_biome_source', value)
          }
          help="auto chooses a safe fallback; argument requires user input; location uses travel location."
        />
        <SelectField
          label="Repeat encounters"
          value={String(readPath(config, 'policies.exploration.avoid_repeat_encounters') ?? 'off')}
          values={['off', 'same_biome', 'global']}
          onChange={(value) => updateConfig('policies.exploration.avoid_repeat_encounters', value)}
          help="Controls whether recent encounters are excluded from future rolls."
        />
        <FooterBehaviourField
          value={String(readPath(config, 'policies.display.footer_behaviour') ?? 'balanced')}
          onChange={(value) => updateConfig('policies.display.footer_behaviour', value)}
        />
        <JsonField
          label="Player setup and HUD"
          value={
            readPath(config, 'policies.player_setup') ?? {
              enabled: true,
              require_character: true,
              hud: { enabled: true, fields: ['coins', 'wallet', 'location', 'time', 'weather'] },
              checks: [],
            }
          }
          onCommit={(value) => updateConfig('policies.player_setup', value)}
          minRows={8}
        />
        <JsonField
          label="Exploration distribution"
          value={readPath(config, 'subsystems.exploration.config.distribution') ?? {}}
          onCommit={(value) => updateConfig('subsystems.exploration.config.distribution', value)}
          minRows={6}
        />
        <SelectField
          label="Hunt monster art"
          value={monsterArtSelectValue(
            readPath(config, 'subsystems.exploration.config.monster_images.hunt'),
          )}
          values={['thumbnail', 'image', 'off']}
          onChange={(value) =>
            updateConfig('subsystems.exploration.config.monster_images.hunt', value)
          }
          help="Controls where successful hunt embeds put a monster image when one exists."
        />
        <SelectField
          label="Loot monster art"
          value={monsterArtSelectValue(
            readPath(config, 'subsystems.exploration.config.monster_images.loot'),
          )}
          values={['thumbnail', 'image', 'off']}
          onChange={(value) =>
            updateConfig('subsystems.exploration.config.monster_images.loot', value)
          }
          help="Controls where loot session embeds put a monster image when one exists."
        />
        <div className="field">
          <span>
            Hunt DC visibility
            <HelpTip label="Hunt DC visibility help">
              Keep enabled to print the numeric Survival DC. Disable to roll against the same DC
              while only showing generic check text.
            </HelpTip>
          </span>
          <label className="switch-line">
            <input
              type="checkbox"
              checked={
                readPath(config, 'subsystems.exploration.config.show_check_dcs.hunt') !== false
              }
              onChange={(event) =>
                updateConfig(
                  'subsystems.exploration.config.show_check_dcs.hunt',
                  event.target.checked,
                )
              }
            />
            <span>Show hunt DC</span>
          </label>
        </div>
        <div className="field">
          <span>
            Loot DC visibility
            <HelpTip label="Loot DC visibility help">
              Keep enabled to print numeric loot DCs in session and roll text. Disable to show only
              generic check labels.
            </HelpTip>
          </span>
          <label className="switch-line">
            <input
              type="checkbox"
              checked={
                readPath(config, 'subsystems.exploration.config.show_check_dcs.loot') !== false
              }
              onChange={(event) =>
                updateConfig(
                  'subsystems.exploration.config.show_check_dcs.loot',
                  event.target.checked,
                )
              }
            />
            <span>Show loot DCs</span>
          </label>
        </div>
      </div>
    </section>
  );
}

function WorldView({
  config,
  updateConfig,
}: {
  config: ConfigModel;
  updateConfig: (path: string, value: unknown) => void;
}) {
  return (
    <section className="section-panel">
      <SectionTitle
        icon={<Compass size={20} />}
        title="World"
        help="World data connects locations, travel paths, calendars, and biome lookup."
      />
      <div className="form-grid">
        <TextField
          label="Default location"
          value={String(config.world_data.default_location ?? '')}
          onChange={(value) => updateConfig('world_data.default_location', value)}
          help="Used by travel/location commands when no character location is known."
        />
        <JsonField
          label="Locations"
          value={config.world_data.locations ?? {}}
          onCommit={(value) => updateConfig('world_data.locations', value)}
        />
        <JsonField
          label="Paths"
          value={config.world_data.paths ?? []}
          onCommit={(value) => updateConfig('world_data.paths', value)}
        />
      </div>
      <div className="planned-grid">
        <PlannedFeatureButton
          feature={{
            title: 'Location editor',
            detail:
              'Guided location editing will replace the raw JSON box with fields for display, activities, services, library topics, and optional encounter gvars.',
            plannedItems: [
              'Location id/name fields',
              'Activity biome selectors',
              'Location encounter gvar selector',
              'Service command settings',
            ],
          }}
        />
        <PlannedFeatureButton
          feature={{
            title: 'Path builder',
            detail:
              'Guided paths will let you pick from existing locations and build route steps without hand-editing JSON.',
            plannedItems: [
              'From/to location selectors',
              'Travel step editor',
              'Transport requirements',
              'Route validation',
            ],
          }}
        />
      </div>
    </section>
  );
}

function BiomesView({
  config,
  updateConfig,
}: {
  config: ConfigModel;
  updateConfig: (path: string, value: unknown) => void;
}) {
  const biomes = asRecord(config.world_data.biomes);
  const [newCode, setNewCode] = useState('forest');
  const [newPreset, setNewPreset] = useState('forest');
  const [biomeRows, setBiomeRows] = useState<CompactEncounterRow[]>([]);

  function addBiome() {
    const code = normaliseBiomeCode(newCode);
    if (!code) return;
    updateConfig(`world_data.biomes.${code}`, {
      name: formatBiomeName(code),
      gvar_id: engineBiomeGvarId(newPreset),
    });
  }

  function addCustomBiome() {
    const code = normaliseBiomeCode(newCode);
    if (!code) return;
    updateConfig(`world_data.biomes.${code}`, {
      name: formatBiomeName(code),
      gvar_id: undefined,
    });
  }

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<Compass size={20} />}
        title="Biomes"
        help="Biome registry entries map short codes to engine or custom biome gvars."
      />
      <div className="biome-add-row">
        <label className="field">
          <span>Biome code</span>
          <input
            value={newCode}
            onChange={(event) => setNewCode(event.target.value)}
            placeholder="forest or misty_forest"
          />
        </label>
        <label className="field">
          <span>Preset source</span>
          <select value={newPreset} onChange={(event) => setNewPreset(event.target.value)}>
            {ENGINE_BIOMES.map((code) => (
              <option key={code} value={code}>
                {formatBiomeName(code)} - {ENGINE_BIOME_NOTES[code]}
              </option>
            ))}
          </select>
        </label>
        <div className="button-row biome-add-actions">
          <button type="button" onClick={addBiome}>
            <Save size={16} aria-hidden="true" />
            Add Preset Biome
          </button>
          <button type="button" onClick={addCustomBiome}>
            <FileCode2 size={16} aria-hidden="true" />
            Add Custom Biome
          </button>
        </div>
      </div>
      <div className="planned-grid">
        <PlannedFeatureButton
          feature={{
            title: 'Generate biome gvar',
            detail:
              'The static editor will later create a new biome gvar body, publish it when a token is available, and write the returned UUID into this registry.',
            plannedItems: [
              'Create empty pools body',
              'Publish custom biome gvar',
              'Insert generated UUID into world_data.biomes',
              'Export generated gvar body when publishing is not available',
            ],
          }}
        />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Use preset</th>
              <th>Preset / custom gvar</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(biomes).map(([code, value]) => {
              const biome = asRecord(value);
              const preset = presetFromGvarId(biome.gvar_id);
              const usePreset = Boolean(preset);
              const gvarId = String(biome.gvar_id ?? '');
              const error = usePreset ? '' : customGvarError(gvarId);

              return (
                <tr key={code}>
                  <td>{code}</td>
                  <td>
                    <input
                      value={String(biome.name ?? '')}
                      onChange={(event) =>
                        updateConfig(`world_data.biomes.${code}.name`, event.target.value)
                      }
                    />
                  </td>
                  <td>
                    <label className="switch-line">
                      <input
                        type="checkbox"
                        checked={usePreset}
                        onChange={(event) =>
                          updateConfig(
                            `world_data.biomes.${code}.gvar_id`,
                            event.target.checked ? engineBiomeGvarId(ENGINE_BIOMES[0]) : undefined,
                          )
                        }
                      />
                      <span>use preset</span>
                    </label>
                  </td>
                  <td>
                    {usePreset ? (
                      <select
                        value={preset}
                        onChange={(event) =>
                          updateConfig(
                            `world_data.biomes.${code}.gvar_id`,
                            engineBiomeGvarId(event.target.value),
                          )
                        }
                      >
                        {ENGINE_BIOMES.map((presetCode) => (
                          <option key={presetCode} value={presetCode}>
                            {formatBiomeName(presetCode)} - {ENGINE_BIOME_NOTES[presetCode]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="stacked-field">
                        <input
                          className={error && gvarId.trim() ? 'invalid' : undefined}
                          value={gvarId}
                          onChange={(event) =>
                            updateConfig(
                              `world_data.biomes.${code}.gvar_id`,
                              event.target.value || undefined,
                            )
                          }
                          onBlur={() => {
                            if (!gvarId.trim()) return;
                            try {
                              updateConfig(
                                `world_data.biomes.${code}.gvar_id`,
                                normalizeGvarId(gvarId),
                              );
                            } catch {
                              // Validation text below handles this without changing input.
                            }
                          }}
                          placeholder="custom biome gvar UUID"
                        />
                        {error ? <small className="field-note">{error}</small> : null}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <JsonField
        label="Biome registry JSON"
        value={biomes}
        onCommit={(value) => updateConfig('world_data.biomes', value)}
      />
      <div className="biome-gvar-workbench">
        <EncounterRowBuilder
          rows={biomeRows}
          onRowsChange={setBiomeRows}
          title="Custom biome row builder"
          rowListTitle="Custom biome gvar body"
        />
      </div>
    </section>
  );
}

function EncountersView() {
  const [rows, setRows] = useState<CompactEncounterRow[]>([]);

  return (
    <section className="section-panel">
      <SectionTitle
        icon={<FileCode2 size={20} />}
        title="Encounters"
        help="Build compact JSON rows for biome gvars, with pool tags first and template args after."
      />
      <EncounterRowBuilder rows={rows} onRowsChange={setRows} />
      <div className="planned-grid">
        <PlannedFeatureButton
          feature={{
            title: 'Custom templates',
            detail:
              'Custom encounter templates need a schema editor and validation before they can be safely generated into gvar code.',
            plannedItems: [
              'Template name',
              'Field definitions',
              'Factory output preview',
              'Template export',
            ],
          }}
        />
      </div>
    </section>
  );
}

function ExportView(props: {
  serialized: string;
  configId: string;
  shareLink: string;
  steps: RunStep[];
  publishToAvrae: () => void;
  copy: (text: string, label: string) => Promise<void>;
  canPublish: boolean;
  isBusy: boolean;
}) {
  return (
    <section className="section-panel">
      <SectionTitle
        icon={<FileDown size={20} />}
        title="Export"
        help="Exports never include tokens. Publishing uses the token only from the current browser form."
      />
      <div className="button-row">
        <button type="button" onClick={() => props.copy(props.serialized, 'Gvar body')}>
          <Clipboard size={16} aria-hidden="true" />
          Copy Gvar
        </button>
        <button
          type="button"
          onClick={() => downloadText('westmarch_config.gvar', props.serialized)}
        >
          <Download size={16} aria-hidden="true" />
          Download Gvar
        </button>
        <button type="button" onClick={() => props.copy(props.shareLink, 'Share link')}>
          <Clipboard size={16} aria-hidden="true" />
          Copy Link
        </button>
        <button
          type="button"
          className="primary"
          onClick={props.publishToAvrae}
          disabled={!props.canPublish || props.isBusy}
        >
          <UploadCloud size={16} aria-hidden="true" />
          Publish
        </button>
      </div>
      <label className="field">
        <span>Share link</span>
        <input readOnly value={props.shareLink} />
      </label>
      <label className="field">
        <span>Generated gvar body</span>
        <textarea className="code-input" rows={20} readOnly value={props.serialized} />
      </label>
      <RunSteps steps={props.steps} />
    </section>
  );
}

function RawSourceView({
  rawSource,
  setRawSource,
  parsedMode,
}: {
  rawSource: string;
  setRawSource: (value: string) => void;
  parsedMode: string;
}) {
  return (
    <section className="section-panel">
      <SectionTitle
        icon={<FileCode2 size={20} />}
        title="Raw Source"
        help="Raw editing preserves content the structural parser cannot understand."
      />
      <span className="badge neutral">Parse mode: {parsedMode}</span>
      <textarea
        className="code-input raw-editor"
        value={rawSource}
        onChange={(event) => setRawSource(event.target.value)}
        spellCheck={false}
      />
    </section>
  );
}

function EmptyState({ setSection }: { setSection: (section: Section) => void }) {
  return (
    <section className="section-panel empty">
      <FileText size={28} aria-hidden="true" />
      <h2>No Config Loaded</h2>
      <button type="button" onClick={() => setSection('setup')}>
        <UploadCloud size={16} aria-hidden="true" />
        Open Setup
      </button>
    </section>
  );
}
