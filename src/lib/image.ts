export async function fileToCompressedAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be smaller than 5MB.");

  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(file);
  });

  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not decode that image."));
    image.src = source;
  });

  const ratio = Math.min(512 / image.width, 512 / image.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image editing is not supported in this browser.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const compressed = canvas.toDataURL("image/jpeg", 0.82);
  if (compressed.length > 100_000) {
    const smaller = document.createElement("canvas");
    smaller.width = Math.max(1, Math.round(canvas.width * 0.7));
    smaller.height = Math.max(1, Math.round(canvas.height * 0.7));
    const smallerContext = smaller.getContext("2d");
    if (!smallerContext) throw new Error("Image editing is not supported in this browser.");
    smallerContext.drawImage(canvas, 0, 0, smaller.width, smaller.height);
    return smaller.toDataURL("image/jpeg", 0.72);
  }
  return compressed;
}
