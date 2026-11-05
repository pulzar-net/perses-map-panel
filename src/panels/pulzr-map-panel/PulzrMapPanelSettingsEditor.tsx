import { TextField } from '@mui/material';
import {
  FormatControls,
  OptionsEditorColumn,
  OptionsEditorGrid,
  OptionsEditorGroup,
  ThresholdsEditor,
} from '@perses-dev/components';
import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import type { ReactElement } from 'react';

import type { PulzrMapPanelOptions } from './pulzr-map-panel-types';

type TextKey = 'styleUrl' | 'latitudeLabel' | 'longitudeLabel';

export function PulzrMapPanelSettingsEditor({
  value,
  onChange,
}: OptionsEditorProps<PulzrMapPanelOptions>): ReactElement {
  const text = (key: TextKey, label: string, placeholder: string): ReactElement => (
    <TextField
      size="small"
      label={label}
      placeholder={placeholder}
      value={value[key] ?? ''}
      onChange={(e) => onChange({ ...value, [key]: e.target.value || undefined })}
    />
  );
  return (
    <OptionsEditorGrid>
      <OptionsEditorColumn>
        <OptionsEditorGroup title="Map">
          {text('styleUrl', 'Style URL', 'Carto, light or dark')}
          {text('latitudeLabel', 'Latitude label', 'latitude')}
          {text('longitudeLabel', 'Longitude label', 'longitude')}
          <TextField
            size="small"
            type="number"
            label="Point radius"
            value={value.radius ?? ''}
            onChange={(e) => onChange({ ...value, radius: e.target.value === '' ? undefined : Number(e.target.value) })}
          />
          <FormatControls
            value={value.format ?? { unit: 'decimal' }}
            onChange={(format) => onChange({ ...value, format })}
          />
        </OptionsEditorGroup>
      </OptionsEditorColumn>
      <OptionsEditorColumn>
        <ThresholdsEditor
          hideDefault
          disablePercentMode
          thresholds={value.thresholds}
          onChange={(thresholds) => onChange({ ...value, thresholds })}
        />
      </OptionsEditorColumn>
    </OptionsEditorGrid>
  );
}
