import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    // const filePath = e.target.value.split(/\\/g);

    // [BUG HUNT "Bills" CORRECTION] - Autorize only jpeg, png or jpg files
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    const fileName = file.name;
    const regex = new RegExp("(.png|.jpeg|.jpg|.PNG|.JPEG|.JPG)$");
    const message = this.document.createElement("div");
    message.classList.add("error-message");
    message.innerHTML = `Fichier "${fileName}" non valide`;
    if (fileName.match(regex) == null) {
      if (this.document.querySelector(".error-message")) {
        this.document.querySelector(".error-message").remove();
      }
      fileInput.parentNode.appendChild(message);
    } else {
      if (this.document.querySelector(".error-message")) {
        this.document.querySelector(".error-message").remove();
      }
      // END [BUG HUNT "Bills" CORRECTION]
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    // [BUG HUNT "Bills" CORRECTION] - Code to autorize only jpeg png or jpg files
    if (!this.document.querySelector(".error-message")) {
      // END [BUG HUNT "Bills" CORRECTION]
      console.log(
        'e.target.querySelector(`input[data-testid="datepicker"]`).value',
        e.target.querySelector(`input[data-testid="datepicker"]`).value
      );
      // [CORRECTION CALL API] - Api were created on file change instead of on submit
      const file = e.target.querySelector(`input[data-testid="file"]`).files[0];
      const formData = new FormData();
      //
      const email = JSON.parse(localStorage.getItem("user")).email;
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`)
          .value,
        name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(
          e.target.querySelector(`input[data-testid="amount"]`).value
        ),
        date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct:
          parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
          20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
          .value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: "pending",
      };
      // [CORRECTION CALL API] - Api were created on file change instead of on submit
      formData.append("file", file);
      formData.append("email", email);
      if (this.store) {
        this.store
          .bills()
          .create({
            data: formData,
            headers: {
              noContentType: true,
            },
          })
          .then(({ fileUrl, key }) => {
            this.billId = key;
            this.fileUrl = fileUrl;
            this.fileName = file.name;
            this.updateBill(bill);
          })
          .catch((error) => console.error(error));
      }
      //
      this.onNavigate(ROUTES_PATH["Bills"]);
    }
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
