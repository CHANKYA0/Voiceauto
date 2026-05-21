export async function blobToFile(blob: Blob, name: string): Promise<File> {
  return new File([blob], name, { type: blob.type || 'audio/webm' });
}

export function base64ToAudioUrl(base64: string, mimeType = 'audio/mpeg') {
  return `data:${mimeType};base64,${base64}`;
}
