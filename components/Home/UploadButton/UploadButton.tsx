import styles from "./UploadButton.module.css";

export default function UploadButton({ text }: { text: string }) {
  return (
    <button className={styles.upload_button}>
      {text}
    </button>
  );
}