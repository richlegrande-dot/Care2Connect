import { render, screen } from "@testing-library/react";
import HomePage from "../app/page";

// Mock next/link since HomePage is a server component
jest.mock("next/link", () => {
  return ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: any;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the main heading with CareConnect", () => {
    render(<HomePage />);

    // "CareConnect" appears in multiple places (heading + features section)
    const careConnectElements = screen.getAllByText(/CareConnect/);
    expect(careConnectElements.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(
        /A Community-Supported Portal for People Experiencing Homelessness/,
      ),
    ).toBeInTheDocument();
  });

  it("shows the story sharing section", () => {
    render(<HomePage />);

    // "Share Your Story" appears in multiple places (feature cards + CTA)
    const storyElements = screen.getAllByText(/Share Your Story/);
    expect(storyElements.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(
        /Record your voice to help others understand your journey/,
      ),
    ).toBeInTheDocument();
  });

  it("displays feature cards", () => {
    render(<HomePage />);

    expect(screen.getByText("Find Work")).toBeInTheDocument();
    expect(screen.getByText("Access Resources")).toBeInTheDocument();
  });

  it("shows how CareConnect helps section", () => {
    render(<HomePage />);

    expect(screen.getByText(/How CareConnect Helps/)).toBeInTheDocument();
  });

  it("shows the tell your story CTA", () => {
    render(<HomePage />);

    expect(screen.getByText(/TELL YOUR/)).toBeInTheDocument();
    expect(screen.getByText(/STORY/)).toBeInTheDocument();
  });

  it("shows community support tools section", () => {
    render(<HomePage />);

    expect(screen.getByText(/Additional Support Tools/)).toBeInTheDocument();
    expect(
      screen.getByText(/Everything you need to connect with your community/),
    ).toBeInTheDocument();
  });

  it("shows privacy and control messaging", () => {
    render(<HomePage />);

    expect(screen.getByText(/in control/)).toBeInTheDocument();
  });

  it("has proper heading hierarchy", () => {
    render(<HomePage />);

    const mainHeading = screen.getByRole("heading", { level: 1 });
    expect(mainHeading).toBeInTheDocument();
  });

  it("is responsive with Tailwind classes", () => {
    const { container } = render(<HomePage />);

    const responsiveElements = container.querySelectorAll(
      '[class*="md:"], [class*="lg:"], [class*="sm:"]',
    );
    expect(responsiveElements.length).toBeGreaterThan(0);
  });

  it("includes link to tell your story", () => {
    render(<HomePage />);

    const storyLinks = screen.getAllByRole("link");
    const tellStoryLink = storyLinks.find(
      (link) => link.getAttribute("href") === "/tell-your-story",
    );
    expect(tellStoryLink).toBeDefined();
  });
});
