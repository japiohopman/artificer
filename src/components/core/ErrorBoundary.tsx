import React, { ErrorInfo, ReactNode } from 'react';
import { GameIcon } from '../../game_icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error caught by ${this.props.name || 'ErrorBoundary'}:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border-2 border-red-200 rounded-2xl text-center space-y-4 max-w-md mx-auto shadow-lg">
          <div className="bg-red-100 p-3 rounded-full">
            <GameIcon name="alert" size={32} color="#DC2626" />
          </div>
          <div className="space-y-2">
            <h3 className="font-header text-xl text-red-800 uppercase tracking-wider">Arcane Interference Detected</h3>
            <p className="font-body text-sm text-red-600 italic">
              "The scroll for this entity appears to be corrupted or written in a lost tongue."
            </p>
          </div>
          
          <div className="bg-white/50 p-3 rounded-lg border border-red-100 w-full overflow-hidden">
            <p className="text-[10px] font-mono text-red-500 break-words opacity-70">
              {this.state.error?.message || 'Unknown mystical error'}
            </p>
          </div>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-bold uppercase text-xs hover:bg-red-700 transition-colors shadow-md"
          >
            <GameIcon name="dice_roll" size={14} color="#FFFFFF" className="animate-pulse" />
            Restabilize Essence
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
