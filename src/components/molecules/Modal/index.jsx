import { useEffect } from "react";
import "./style.css";

export const Modal = ({
  IconModal,
  titleModal,
  subtitleModal,
  onClickCancel,
  onClickTrue,
  titleOnClickTrueBtn,
  iconModalBg1,
  bgBtnTrue,
}) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClickCancel?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClickCancel]);

  return (
  <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-description">
    <div className={`confirm-modal__icon ${iconModalBg1 || ""}`}>{IconModal}</div>
    <h2 id="confirm-modal-title">{titleModal}</h2>
    <p id="confirm-modal-description">{subtitleModal}</p>
    <div className="confirm-modal__actions">
      <button type="button" onClick={onClickCancel}>Batal</button>
      <button type="button" onClick={onClickTrue} className={bgBtnTrue || ""}>{titleOnClickTrueBtn}</button>
    </div>
  </section>
  );
};
