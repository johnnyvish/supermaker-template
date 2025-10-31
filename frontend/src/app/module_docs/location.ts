/**
 * Generated documentation for location module.
 * This file is auto-generated from module_types/location.ts
 */

export const location = {
  moduleName: "location",
  description: "Location API for GPS and geocoding. Provides GPS positioning, continuous tracking, and geocoding. Requires location permissions for all features.",
  userDescription: "Access device GPS location, track position changes, and convert between addresses and coordinates with geocoding.",
  
  functions: {
    getCurrentPosition: {
      name: "getCurrentPosition",
      description: "Gets current GPS position.",
      documentation: `
Signature: (accuracy?: LocationAccuracy) => Promise<LocationObject>
Param Info:
  - accuracy: Desired accuracy level (low, balanced, high, highest)
`
    },
    
    watchPosition: {
      name: "watchPosition",
      description: "Watches position changes.",
      documentation: `
Signature: (accuracy?: LocationAccuracy, timeInterval?: number, distanceInterval?: number) => Promise<string>
Param Info:
  - accuracy: Desired accuracy
  - timeInterval: Min time between updates (ms)
  - distanceInterval: Min distance between updates (m)
`
    },
    
    clearWatch: {
      name: "clearWatch",
      description: "Stops watching position.",
      documentation: `
Signature: (watchId: string) => Promise<boolean>
Param Info:
  - watchId: ID returned from watchPosition
`
    },
    
    geocodeAddress: {
      name: "geocodeAddress",
      description: "Converts address to coordinates.",
      documentation: `
Signature: (address: string) => Promise<LocationGeocodedLocation[]>
Param Info:
  - address: Address string to geocode
`
    },
    
    reverseGeocode: {
      name: "reverseGeocode",
      description: "Converts coordinates to address.",
      documentation: `
Signature: (latitude: number, longitude: number) => Promise<LocationGeocodedAddress[]>
Param Info:
  - latitude: Latitude in degrees
  - longitude: Longitude in degrees
`
    },
    
    isLocationServicesEnabled: {
      name: "isLocationServicesEnabled",
      description: "Checks if location services enabled.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getLastKnownPosition: {
      name: "getLastKnownPosition",
      description: "Gets cached position.",
      documentation: `
Signature: (maxAge?: number, requiredAccuracy?: number) => Promise<LocationObject | null>
Param Info:
  - maxAge: Max cache age in milliseconds
  - requiredAccuracy: Minimum required accuracy in meters
`
    }
  },
  
  types: {
    LocationAccuracy: {
      type: "\"low\" | \"balanced\" | \"high\" | \"highest\"",
      description: ""
    },
    LocationObjectCoords: {
      type: "interface",
      description: "Type representing the location GPS related data",
      properties: {
        latitude: "The latitude in degrees",
        longitude: "The longitude in degrees",
        altitude: "The altitude in meters above the WGS 84 reference ellipsoid. Can be null on Web if it's not available",
        accuracy: "The radius of uncertainty for the location, measured in meters. Can be null on Web if it's not available",
        altitudeAccuracy: "The accuracy of the altitude value, in meters. Can be null on Web if it's not available",
        heading: "Horizontal direction of travel of this device, measured in degrees starting at due north and continuing clockwise around the compass. Thus, north is 0 degrees, east is 90 degrees, south is 180 degrees, and so on. Can be null on Web if it's not available",
        speed: "The instantaneous speed of the device in meters per second. Can be null on Web if it's not available"
      }
    },
    LocationObject: {
      type: "interface",
      description: "Type representing the location object",
      properties: {
        coords: "The coordinates of the position",
        timestamp: "The time at which this position information was obtained, in milliseconds since epoch",
        mocked: "Whether the location coordinates is mocked or not (Android only)"
      }
    },
    LocationGeocodedLocation: {
      type: "interface",
      description: "Type representing a result of geocodeAsync",
      properties: {
        latitude: "The latitude in degrees",
        longitude: "The longitude in degrees",
        altitude: "The altitude in meters above the WGS 84 reference ellipsoid",
        accuracy: "The radius of uncertainty for the location, measured in meters"
      }
    },
    LocationGeocodedAddress: {
      type: "interface",
      description: "Type representing a result of reverseGeocodeAsync",
      properties: {
        city: "City name of the address",
        district: "Additional city-level information like district name",
        streetNumber: "Street number of the address",
        street: "Street name of the address",
        region: "The state or province associated with the address",
        subregion: "Additional information about administrative area",
        country: "Localized country name of the address",
        postalCode: "Postal code of the address",
        name: "The name of the placemark, for example, \"Tower Bridge\"",
        isoCountryCode: "Localized (ISO) country code of the address, if available",
        timezone: "The timezone identifier associated with the address (iOS only)",
        formattedAddress: "Composed string of the address components, for example, \"111 8th Avenue, New York, NY\" (Android only)"
      }
    }
  },
  
  example: `
const position = await Native.location.getCurrentPosition("high");
const addresses = await Native.location.reverseGeocode(
position.coords.latitude, position.coords.longitude
);
`
};

// Export for module access
export default location;