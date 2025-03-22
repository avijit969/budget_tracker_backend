import { Context } from "hono";
export type response = {
  secure_url: string;
  public_id: string;
};
const uploadOnCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      `https://backend-with-hono-and-next-git-main-avis-projects-47d18282.vercel.app/api/upload/file`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    return (await response.json()) as response;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

export { uploadOnCloudinary };
