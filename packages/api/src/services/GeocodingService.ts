import axios from 'axios';

export class GeocodingService {
  private static API_KEY = process.env.POSITIONSTACK_API_KEY;
  private static BASE_URL = 'http://api.positionstack.com/v1/forward';

  /**
   * Converts a physical address to Latitude and Longitude
   */
  static async getCoordinates(address: string): Promise<{ lat: number; lng: number }> {
    try {
      if (!this.API_KEY) {
        console.warn('GeocodingService: POSITIONSTACK_API_KEY not found. Returning mock coordinates.');
        return this.getMockCoordinates(address);
      }

      const response = await axios.get(this.BASE_URL, {
        params: {
          access_key: this.API_KEY,
          query: address,
          limit: 1
        }
      });

      const data = response.data.data[0];
      if (!data) throw new Error('Address not found');

      return {
        lat: data.latitude,
        lng: data.longitude
      };
    } catch (err) {
      console.error('Geocoding Error:', err);
      return this.getMockCoordinates(address);
    }
  }

  private static getMockCoordinates(address: string) {
    // Basic mock mapping for common dev locations
    const mocks: Record<string, { lat: number; lng: number }> = {
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'London': { lat: 51.5074, lng: -0.1278 },
      'New York': { lat: 40.7128, lng: -74.0060 }
    };

    for (const city of Object.keys(mocks)) {
      if (address.toLowerCase().includes(city.toLowerCase())) return mocks[city];
    }

    return { lat: 0, lng: 0 };
  }
}
