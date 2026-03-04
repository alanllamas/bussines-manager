// File conversion utilities for encoding browser File objects.

// fileToB64 — converts a browser File object to a base64 string using FileReader.
// Uses readAsDataURL which produces a "data:<mime>;base64,<data>" string.
//
// standard = false (default): returns the full data URL including the MIME prefix.
//   Example: "data:application/pdf;base64,JVBERi0x..."
// standard = true: strips the prefix and returns only the raw base64 data.
//   Example: "JVBERi0x..."
//   Use this when the API expects raw base64 without the data URL wrapper (e.g. Strapi upload).
//
export async function fileToB64(f: File, standard = false): Promise<string> {
  return new Promise((resolve, reject) => {
    // Guard against non-File inputs since this may be called with dynamic form values.
    if (!(f instanceof File)) {
      return reject(new Error('El archivo debe ser un objeto File'));
    }

    const reader = new FileReader();
    // readAsDataURL produces the full "data:<mime>;base64,<data>" string on load.
    reader.readAsDataURL(f);

    reader.onload = () => {
      const base64String = reader.result;
      // readAsDataURL always produces a string; guard handles the ArrayBuffer | null cases.
      if (typeof base64String !== 'string') return reject(new Error('Formato de archivo inválido'));
      resolve(
        !standard
          ? base64String                       // full data URL
          : base64String.split(',')[1]         // raw base64 only (after the comma)
      );
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo: ' + reader.error?.message));
    };
  });
}
