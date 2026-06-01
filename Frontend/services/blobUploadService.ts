import * as FileSystem from "expo-file-system/legacy";

export async function uploadAudioToBlob(localUri: string, fileName: string) {
  try {
    const rawSasUrl = process.env.EXPO_PUBLIC_BLOB_SAS_URL;

    if (!rawSasUrl) {
      throw new Error("SAS URL saknas i .env");
    }

    const sasUrl = rawSasUrl.replace(/^"|"$/g, "").trim();

    const [baseUrl, queryString] = sasUrl.split("?");
    if (!baseUrl || !queryString) {
      throw new Error("Ogiltig SAS URL: saknar blob- eller signaturdel");
    }

    const blobName = encodeURIComponent(fileName.replace(/\\/g, "/").split("/").pop() || fileName);
    const uploadUrl = `${baseUrl}/${blobName}?${queryString}`;

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: "base64",
    });

    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "x-ms-version": "2020-10-02",
        "Content-Type": "audio/m4a",
      },
      body: bytes,
    });

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(`Upload failed: ${response.status}${responseBody ? ` ${responseBody}` : ""}`);
    }

    console.log("Upload OK:", uploadUrl);
    return uploadUrl;
  } catch (error) {
    console.error("uploadAudioToBlob error:", error);
    throw error;
  }
}
