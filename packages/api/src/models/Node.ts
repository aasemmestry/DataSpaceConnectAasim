// For now, we'll use a simple interface and a mock database array 
// unless you have your MongoDB/Postgres connected.
export interface Node {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: 'Active' | 'Provisioning' | 'Maintenance';
  utilization: string;
  offererId: string;
}

export const mockNodes: Node[] = [];