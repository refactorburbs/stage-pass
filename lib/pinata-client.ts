// While we have an uploadFileToPinata on the server (pinata.actions.ts),
// some files may be very large, which is heavy to put in a form submission.
// In these instances, it's actually better to upload from the client and
// Have the form submit with meta data and a url received from here.
// The user also gets more immediate feedback from uploading, as it happens
// before the form is submitted.

export async function uploadFileToPinataClient(file: File): Promise<string> {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch("/api/pinata", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload to Pinata");
  }
  const url = await response.json();
  return url;
}