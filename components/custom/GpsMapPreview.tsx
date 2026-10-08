import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { WebView } from "react-native-webview";
import Text from "@/components/common/Text";

interface GpsMapPreviewProps {
	latitude: number;
	longitude: number;
	isLocating?: boolean;
	onRefresh?: () => void;
}

export default function GpsMapPreview({
	latitude,
	longitude,
	isLocating = false,
	onRefresh,
}: GpsMapPreviewProps) {
	// Generate HTML string for Leaflet OpenStreetMap preview
	const htmlContent = React.useMemo(() => {
		return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #f4f4f5; }
    .leaflet-control-attribution { display: none !important; }
    .custom-pin {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #2563eb;
      border: 3px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    }
    .custom-pulse {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(37,99,235,0.25);
      position: absolute;
      top: -8px;
      left: -8px;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    try {
      var map = L.map('map', {
        center: [${latitude}, ${longitude}],
        zoom: 16,
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      var pinIcon = L.divIcon({
        className: '',
        html: '<div style="position:relative"><div class="custom-pulse"></div><div class="custom-pin"></div></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      L.marker([${latitude}, ${longitude}], { icon: pinIcon }).addTo(map);
    } catch (e) {
      console.error(e);
    }
  </script>
</body>
</html>`;
	}, [latitude, longitude]);

	return (
		<View className="w-full h-44 overflow-hidden rounded-xl border border-border-muted my-1 relative bg-zinc-100">
			<WebView
				originWhitelist={["*"]}
				source={{ html: htmlContent }}
				style={{ width: "100%", height: "100%", backgroundColor: "#f4f4f5" }}
				scrollEnabled={false}
				bounces={false}
				overScrollMode="never"
			/>

			{/* Floating GPS Accuracy / Refresh Button */}
			{onRefresh && (
				<Pressable
					onPress={onRefresh}
					disabled={isLocating}
					className="absolute bottom-2.5 right-2.5 flex-row items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-sm active:bg-zinc-100 border border-zinc-200"
				>
					{isLocating ? (
						<ActivityIndicator size="small" color="#2563eb" />
					) : (
						<Feather name="navigation" size={13} color="#2563eb" />
					)}
					<Text size="small" className="text-xs font-semibold text-primary">
						{isLocating ? "Mencari GPS..." : "GPS Akurat"}
					</Text>
				</Pressable>
			)}
		</View>
	);
}
