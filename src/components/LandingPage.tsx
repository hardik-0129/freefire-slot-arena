import React from 'react';
import './css/LandingPage.css';

const LandingPage = () => {
    const handleDownloadApk = async () => {
        const triggerDownload = async (url: string, filename: string) => {
            try {
                // Always fetch as blob for proper download
                const response = await fetch(url, {
                    mode: 'cors',
                    credentials: 'omit'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();

                // Clean up after a short delay
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                }, 100);

            } catch (err: any) {
                // Fallback: try direct download link
                try {
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.target = '_blank';
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => document.body.removeChild(link), 100);
                } catch (fallbackErr) {
                    // Last resort: open in new tab
                    window.open(url, '_blank');
                }
            }
        };

        try {
            // Get base URL - prefer env variable, or detect backend port
            let base = import.meta?.env?.VITE_API_URL;
            if (!base) {
                // If no env variable, try to detect backend port
                const origin = window.location.origin;
                if (origin.includes('localhost:8080')) {
                    // Frontend on 8080, backend likely on 5000
                    base = origin.replace(':8080', ':5000');
                } else if (origin.includes('localhost')) {
                    // Other localhost setup - use same origin
                    base = origin;
                } else {
                    // Production - use production API URL
                    base = 'https://api1.alphalions.io';
                }
            }

            if (!base) {
                alert('API URL is not configured. Please set VITE_API_URL in your .env file.');
                return;
            }

            const apiUrl = `${base}/api/apk/latest/public`;

            // Always use API to get latest version dynamically
            let res;
            try {
                res = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
            } catch (fetchError: any) {
                alert(`Network error: ${fetchError.message}. Please check your connection.`);
                return;
            }

            if (res.ok) {
                // Check if response is actually JSON
                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await res.text();
                    alert(`Server returned HTML instead of JSON. This usually means the API URL is incorrect.\n\nCurrent API URL: ${apiUrl}\n\nPlease check:\n1. Backend server is running\n2. VITE_API_URL is set correctly in .env file\n3. API endpoint exists: /api/apk/latest/public`);
                    return;
                }

                let data;
                try {
                    data = await res.json();
                } catch (jsonError) {
                    alert('Server returned invalid JSON. Please contact support.');
                    return;
                }

                if (data && data.success && data.fileName) {
                    // Prefer downloadUrl (download endpoint), fallback to direct file URL
                    let downloadUrl = data.downloadUrl;

                    // If no downloadUrl, try to construct it or use direct URL
                    if (!downloadUrl) {
                        if (data.url) {
                            // Use direct file URL from API
                            downloadUrl = data.url.startsWith('http') ? data.url : `${base}${data.url}`;
                        } else if (data.fileName) {
                            // Try download endpoint
                            downloadUrl = `${base}/api/apk/${data.fileName}/download`;
                        }
                    } else {
                        // Make sure downloadUrl is a full URL
                        if (!downloadUrl.startsWith('http')) {
                            downloadUrl = `${base}${downloadUrl}`;
                        }
                    }

                    if (downloadUrl) {
                        await triggerDownload(downloadUrl, data.fileName);
                        return;
                    }
                } else {
                    if (data && data.error) {
                        alert(`API Error: ${data.error}`);
                        return;
                    }
                }
            } else {
                const errorText = await res.text().catch(() => 'Unknown error');
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.error) {
                        alert(`API Error: ${errorData.error}`);
                        return;
                    }
                } catch (e) {
                    // Not JSON, use text
                }
            }

            // If we get here, API failed - show detailed error
            alert(`Unable to download APK. API call failed. Please check:\n1. Server is running\n2. API URL is correct: ${base}\n3. API endpoint exists: /api/apk/latest/public`);
        } catch (e: any) {
            alert(`Error downloading APK: ${e.message || 'Unknown error'}. Please check your connection and try again.`);
        }
    };


    return (
        <div className="landingPage-container container">
            <div className="left">
                <button className="download-btn" onClick={handleDownloadApk}>DOWNLOAD NOW!</button>
            </div>

            <div className="right">
                <img src="/ogimageAlphalions.png" alt="Alpha Lions Logo" />
            </div>
        </div>
    );
};

export default LandingPage;
