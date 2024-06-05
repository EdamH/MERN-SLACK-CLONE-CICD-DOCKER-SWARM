/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import SignunPage from "../pages/register";
// import mockRouter from 'next-router-mock';
import TestQueryProvider from "../components/TestQueryProvider";



describe("SIGNUP PAGE", () => {
  it("renders a required input", () => {
    render(<SignunPage />, { wrapper: TestQueryProvider });

    const input = screen.getByRole("textbox", { name: "Email" });

    expect(input).toBeRequired();
  });
});