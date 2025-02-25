export async function fileToB64(f: File, standard = false): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!(f instanceof File)) {
      return reject(new Error('El archivo debe ser un objeto File'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(f);

    reader.onload = () => {
      const base64String = reader.result;
      resolve(
        !standard
          ? base64String.toString()
          : base64String.toString().split(',')[1]
      );
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo: ' + reader.error?.message));
    };
  });
}
