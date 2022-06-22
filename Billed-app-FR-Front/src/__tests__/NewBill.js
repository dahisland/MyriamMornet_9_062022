/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../app/Store.js";
import {
  mockStore,
  mockCorruptedStore,
  mockEmptyStore,
} from "../__mocks__/store.js";
import router from "../app/Router.js";
import "@testing-library/jest-dom";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      // const html = NewBillUI();
      // document.body.innerHTML = html;
      //to-do write assertion
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowMail = screen.getByTestId("icon-mail");
      expect(windowMail.getAttribute("class")).toMatch(
        new RegExp("active-icon")
      );
    });
    describe("When I load a proof file", () => {
      test("on change file", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "jondoe@mail.com",
            jwt: "jwt",
          })
        );

        //to-do write assertion
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        const input = document.querySelector(`input[data-testid="file"]`);
        const onFileChange = jest.fn(newBill.handleChangeFile);
        const eventLoadFilePNG = {
          target: {
            files: [new File(["(⌐□_□)"], "test.png", { type: "image/png" })],
          },
        };
        input.addEventListener("change", onFileChange);
        fireEvent.change(input, eventLoadFilePNG);
        expect(input.files.length).toBe(1);
        expect(onFileChange).toHaveBeenCalled();
        expect(input.files[0].name).toBe("test.png");
      });
    });
  });
});
