import React, { useEffect, useRef, useState } from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, Container, List, ListItem, ListItemText, ListItemIcon, Divider, Paper, ThemeProvider, createTheme } from '@mui/material';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { Lightbulb, AcUnit, NaturePeople, Construction, Engineering } from '@mui/icons-material';

const API_KEY = "AIzaSyAbxnTK3yUZ0Bs2WSfooCiwaDNxxYSacgo";

// Cyberpunk theme for Material UI
const cyberpunkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#101010',
      paper: '#1B1B1B',
    },
    primary: {
      main: '#FF00FF', // Neon pink accent
    },
    secondary: {
      main: '#00FFFF', // Neon cyan accent
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1B1B1B',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(255, 0, 255, 0.3)',
        },
      },
    },
  },
});

// Cyberpunk-inspired dark map style with default markers hidden
const cyberpunkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1C1C1C' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8A8A8A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1C1C1C' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3A3A3A' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#FF00FF' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#101010' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }, // Hide points of interest icons
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0B0B0B' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3A3A3A' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#FF00FF' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#FF00FF' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#FF00FF' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#00FFFF' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }, // Hide transit icons
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000040' }] },
];

// Sample data for non-crime safety issues in Evanston, IL
const safetyIssuesData = [
  { id: 1, type: 'Pothole', location: { lat: 42.0451, lng: -87.6877 }, description: 'Large pothole reported near Church St' },
  { id: 2, type: 'Broken Streetlight', location: { lat: 42.0500, lng: -87.6857 }, description: 'Streetlight out at Orrington Ave' },
  { id: 3, type: 'Icy Sidewalk', location: { lat: 42.0485, lng: -87.6828 }, description: 'Icy sidewalk near Davis St' },
  { id: 4, type: 'Construction Zone', location: { lat: 42.0460, lng: -87.6840 }, description: 'Road construction causing traffic delays on Maple Ave' },
  { id: 5, type: 'Fallen Debris', location: { lat: 42.0475, lng: -87.6815 }, description: 'Tree branch blocking pedestrian path at Ridge Ave' },
];

// Center location set to Evanston, IL
const defaultCenter = { lat: 42.0451, lng: -87.6877 };

// Helper function to get the icon URL based on the safety issue type
const getIconUrl = (type) => {
  switch (type) {
    case 'Pothole':
      return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    case 'Broken Streetlight':
      return 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png';
    case 'Icy Sidewalk':
      return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    case 'Construction Zone':
      return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    case 'Fallen Debris':
      return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
    default:
      return 'https://maps.google.com/mapfiles/ms/icons/grey-dot.png';
  }
};

// Helper function to return the appropriate Material UI icon for each safety issue in the list
const getSafetyIssueIcon = (type) => {
  switch (type) {
    case 'Pothole':
      return <Construction style={{ color: '#FFD700' }} />;
    case 'Broken Streetlight':
      return <Lightbulb style={{ color: '#FFA500' }} />;
    case 'Icy Sidewalk':
      return <AcUnit style={{ color: '#00FFFF' }} />;
    case 'Construction Zone':
      return <Engineering style={{ color: '#FF00FF' }} />;
    case 'Fallen Debris':
      return <NaturePeople style={{ color: '#4caf50' }} />;
    default:
      return null;
  }
};

const App = () => {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Set up the markers using google.maps.Marker with custom icons
  useEffect(() => {
    const initializeMarkers = () => {
      if (mapRef.current && window.google) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        safetyIssuesData.forEach(issue => {
          const marker = new window.google.maps.Marker({
            position: issue.location,
            map: mapRef.current,
            title: issue.type,
            icon: {
              url: getIconUrl(issue.type),
              scaledSize: new window.google.maps.Size(40, 40),
            },
          });

          marker.addListener('click', () => {
            setSelectedIssue(issue);
          });

          markersRef.current.push(marker);
        });
      }
    };

    const timeoutId = setTimeout(initializeMarkers, 500);
    return () => clearTimeout(timeoutId);
  }, [mapRef.current]);

  const handleListItemClick = (issue) => {
    if (mapRef.current) {
      mapRef.current.panTo(issue.location);
      setSelectedIssue(issue);
    }
  };

  return (
    <ThemeProvider theme={cyberpunkTheme}>
      <CssBaseline />
      <AppBar position="static" color="primary" elevation={0} style={{ marginBottom: '20px' }}>
        <Toolbar>
          <Typography variant="h6" color="secondary">City Safety Issues</Typography>
        </Toolbar>
      </AppBar>

      <Container style={{ display: 'flex', height: '80vh', gap: '20px' }}>
        <LoadScript googleMapsApiKey={API_KEY}>
          <GoogleMap
            mapContainerStyle={{ height: "100%", width: "70%", borderRadius: '8px', boxShadow: '0 4px 12px rgba(255, 0, 255, 0.5)' }}
            center={defaultCenter}
            zoom={15}
            options={{ styles: cyberpunkMapStyles, disableDefaultUI: true }}
            onLoad={map => {
              mapRef.current = map;
            }}
          />
        </LoadScript>

        <Paper style={{ width: '30%', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom color="secondary">Recent Safety Issues</Typography>
          <List>
            {safetyIssuesData.map(issue => (
              <div key={issue.id}>
                <ListItem button onClick={() => handleListItemClick(issue)} style={{ borderRadius: '8px', margin: '5px 0' }}>
                  <ListItemIcon>{getSafetyIssueIcon(issue.type)}</ListItemIcon>
                  <ListItemText primary={issue.type} secondary={issue.description} />
                </ListItem>
                <Divider variant="inset" component="li" />
              </div>
            ))}
          </List>
        </Paper>

        {selectedIssue && (
          <Paper style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            padding: '15px',
            borderRadius: '8px',
            width: '250px',
            boxShadow: '0 4px 12px rgba(0, 255, 255, 0.5)',
          }}>
            <Typography variant="subtitle1" color="primary">{selectedIssue.type}</Typography>
            <Typography variant="body2" color="textSecondary">{selectedIssue.description}</Typography>
            <button onClick={() => setSelectedIssue(null)} style={{ marginTop: '10px', color: '#FF00FF', background: 'transparent', border: 'none', cursor: 'pointer' }}>Close</button>
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default App;