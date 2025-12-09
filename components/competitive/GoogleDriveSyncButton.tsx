import React, { useState } from "react";
import { useCompetitiveUser } from "../../contexts/CompetitiveUserContext";
import { Cloud, CloudOff, RefreshCw, Check } from "lucide-react";

const GoogleDriveSyncButton: React.FC = () => {
  const { isGoogleDriveSynced, syncWithGoogleDrive, disconnectGoogleDrive, lastSyncTime } =
    useCompetitiveUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    setShowSuccess(false);

    try {
      await syncWithGoogleDrive();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to sync with Google Drive");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect from Google Drive?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await disconnectGoogleDrive();
    } catch (err: any) {
      setError(err.message || "Failed to disconnect from Google Drive");
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return "Never";
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return lastSyncTime.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {isGoogleDriveSynced ? (
            <div className="p-3 bg-green-100 rounded-lg">
              <Cloud className="w-6 h-6 text-green-600" />
            </div>
          ) : (
            <div className="p-3 bg-slate-100 rounded-lg">
              <CloudOff className="w-6 h-6 text-slate-600" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-slate-900">Google Drive Backup</h3>
            <p className="text-sm text-slate-600 mt-1">
              {isGoogleDriveSynced
                ? "Your data is automatically synced to Google Drive"
                : "Connect to backup your data to Google Drive"}
            </p>
            {isGoogleDriveSynced && (
              <p className="text-xs text-slate-500 mt-1">Last sync: {formatLastSync()}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {isGoogleDriveSynced ? (
            <>
              <button
                onClick={handleSync}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : showSuccess ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {isLoading ? "Syncing..." : showSuccess ? "Synced!" : "Sync Now"}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={handleSync}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  Connect Google Drive
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-xs text-red-500 mt-1">
            Make sure you've configured VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY in your .env
            file
          </p>
        </div>
      )}

      {showSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600 font-medium">✓ Successfully synced to Google Drive</p>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Benefits of Google Drive Sync</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Access your test history from any device</li>
          <li>• Automatic backup prevents data loss</li>
          <li>• Data syncs in real-time after each test</li>
          <li>• Stored securely in your personal Google Drive</li>
        </ul>
      </div>
    </div>
  );
};

export default GoogleDriveSyncButton;
