import * as React from 'react';

export interface BaseInputProps<TEventArgs> {
  /**
   * Event emitted once the value changes.
   */
  onChange?(e: TEventArgs): void;
  /**
   * The currently displayed error message.
   */
  error?: React.ReactChild;
}

export interface ValidatorProps {
  onSuccess?(): void;
  onError?(): void;
}

export interface ValidatorState {
  error: React.ReactChild | undefined;
}

/**
 * Provides automatic validation for a wrapped component.
 * @param validate The validation function.
 * @returns A constructor function taking a component to be wrapped with the validator.
 */
export function withValidator<TEventArgs>(validate: (e: TEventArgs) => React.ReactChild | undefined) {
  return <TProps extends BaseInputProps<TEventArgs>>(
    Component: React.ComponentType<TProps>,
  ): React.ComponentType<TProps & ValidatorProps> => {
    return class Validator extends React.PureComponent<TProps & ValidatorProps, ValidatorState> {
      constructor(props: TProps & ValidatorProps) {
        super(props);
        this.state = {
          error: undefined,
        };
      }

      validate = (e: TEventArgs) => {
        const { onChange, onError, onSuccess } = this.props;
        const error = validate(e);

        if (error !== this.state.error) {
          const notify = error ? onError : onSuccess;

          this.setState({
            error,
          });

          if (typeof notify === 'function') {
            notify();
          }
        }

        if (typeof onChange === 'function') {
          onChange(e);
        }
      };

      render() {
        const { error } = this.state;
        return <Component {...this.props} error={error || this.props.error} onChange={this.validate} />;
      }
    };
  };
}
