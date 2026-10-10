import { Field } from './field'
export function LanguageField({ disabled = false }: { disabled?: boolean }) {
  return (
    <Field
      label="Preferred language"
      hint="Hausa is the MVP priority. Live transcription is not connected yet."
    >
      {(props) => (
        <select {...props} defaultValue="ha" disabled={disabled}>
          <option value="ha">Hausa · MVP language</option>
          <option disabled>Nigerian English · awaiting supported ASR</option>
          <option disabled>Yoruba · planned</option>
          <option disabled>Igbo · planned</option>
        </select>
      )}
    </Field>
  )
}
