import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CloudflareTunnelCard from "../../components/CloudflareTunnelCard";

// Mock NEXT_PUBLIC_BACKEND_URL
process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:3001";

describe("CloudflareTunnelCard", () => {
  beforeEach(() => {
    // reset fetch mocks
    (global as any).fetch = jest.fn();
    // mock clipboard
    (navigator as any).clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    localStorage.clear();
  });

  it("renders info from API and copies commands", async () => {
    (global as any).fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            backendPort: 3002,
            localTarget: "http://localhost:3002",
            quickTunnelCommand:
              "cloudflared tunnel --url http://localhost:3002",
            installUrl: "https://example",
          }),
      }),
    );

    render(<CloudflareTunnelCard token={"testtoken"} />);

    expect(screen.getByText(/Loading tunnel guidance/)).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.queryByText(/Loading tunnel guidance/),
      ).not.toBeInTheDocument(),
    );

    expect(screen.getByText(/Backend port:/)).toBeInTheDocument();
    expect(screen.getByText(/Local target:/)).toBeInTheDocument();

    const quickBtn = screen.getByText(/Copy quick tunnel command/);
    fireEvent.click(quickBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "cloudflared tunnel --url http://localhost:3002",
    );
  });

  it("validates public URL and persists to localStorage", async () => {
    (global as any).fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            backendPort: 3002,
            localTarget: "http://localhost:3002",
            quickTunnelCommand:
              "cloudflared tunnel --url http://localhost:3002",
            installUrl: "https://example",
          }),
      }),
    );

    render(<CloudflareTunnelCard token={"testtoken"} />);

    await waitFor(() =>
      expect(
        screen.queryByText(/Loading tunnel guidance/),
      ).not.toBeInTheDocument(),
    );

    const input = screen.getByLabelText(
      "public-tunnel-url",
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "http://insecure.local" } });
    expect(
      await screen.findByText(/Invalid public tunnel URL/),
    ).toBeInTheDocument();

    fireEvent.change(input, {
      target: { value: "https://good.trycloudflare.com" },
    });
    await waitFor(() =>
      expect(
        screen.queryByText(/Invalid public tunnel URL/),
      ).not.toBeInTheDocument(),
    );

    // computed endpoint displayed
    expect(
      screen.getByText(/Paste this into Stripe Dashboard/),
    ).toBeInTheDocument();

    // stored in localStorage
    expect(localStorage.getItem("careconnect.publicTunnelUrl")).toBe(
      "https://good.trycloudflare.com",
    );
  });
});
