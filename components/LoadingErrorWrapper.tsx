import React from 'react'

interface LoadingErrorWrapperProps {
  loading: boolean
  error: string | null
  children: React.ReactNode
  onRetry?: () => void
}

const LoadingErrorWrapper: React.FC<LoadingErrorWrapperProps> = ({
  loading,
  error,
  children,
  onRetry
}) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-lg text-base-content">טוען נתונים...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-error mb-4">שגיאה בטעינת הנתונים</h1>
          <p className="text-base-content mb-6">{error}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="btn btn-primary"
            >
              נסה שוב
            </button>
          )}
          <div className="mt-4 text-sm text-base-content/70">
            <p>וודא שהגדרת את משתני הסביבה של Supabase</p>
            <p className="mt-1">
              <code className="text-xs">VITE_SUPABASE_URL</code> ו-
              <code className="text-xs">VITE_SUPABASE_ANON_KEY</code>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default LoadingErrorWrapper