/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import SigninPage from "../pages/signin";
// import mockRouter from 'next-router-mock';
import TestQueryProvider from "../components/TestQueryProvider";



describe("SIGNIN PAGE", () => {
  it("renders a required input", () => {
    render(<SigninPage />, { wrapper: TestQueryProvider });

    const input = screen.getByRole("textbox", { name: "Email" });

    expect(input).toBeRequired();
  });
});

