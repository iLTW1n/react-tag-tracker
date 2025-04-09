import { render, screen } from './main';

describe('TagTracker', () => {
  it('should render without crashing', () => {
    render(<>click</>);
    expect(screen.getByText('click')).toBeInTheDocument();
  });

  it('should find an element with data-track attribute', () => {
    const { container } = render(<button data-track='false'>click</button>);
    const element = container.querySelector('[data-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track');
    expect(element).toHaveAttribute('data-track', 'false');
  });

  it('should find an element with data-track attribute and custom value', () => {
    const { container } = render(<button data-track='{"event":"test"}'>click</button>);
    const element = container.querySelector('[data-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track');
    expect(element).toHaveAttribute('data-track', '{"event":"test"}');
  });

  it('should find an element with a custom attribute.', () => {
    const { container } = render(<button data-custom-track='{"event":"test"}'>click</button>, {
      providerProps: {
        trackingAttribute: 'data-custom-track',
      },
    });
    const element = container.querySelector('[data-custom-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-custom-track');
    expect(element).toHaveAttribute('data-custom-track', '{"event":"test"}');
  });
});
