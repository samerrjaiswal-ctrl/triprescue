export interface Booking {
  id: string;
  trip_id: string;
  type: 'FLIGHT' | 'TRANSFER' | 'HOTEL' | 'TRAIN' | 'ACTIVITY';
  title: string;
  code: string;
  provider: string;
  operator: string;
  origin: string;
  destination: string;
  origin_hub: string;
  dest_hub: string;
  start_time: string;
  end_time: string;
  cost: number;
  status: 'CONFIRMED' | 'AT_RISK' | 'CRITICAL' | 'REBOOKED' | 'CANCELLED';
  is_important: boolean;
  notes?: string;
  details: string[];
  buffer_to_next?: string;
}

export interface Dependency {
  source_id: string;
  target_id: string;
  type: 'TRANSIT' | 'CHECKIN' | 'ACTIVITY';
  buffer_minutes: number;
  status: 'SAFE' | 'AT_RISK' | 'VIOLATED';
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  traveler_count: number;
  budget_ceiling: number;
  recovery_strategy: 'best_overall' | 'cheapest' | 'fastest';
  status: 'ACTIVE' | 'DISRUPTED' | 'RECOVERED';
  trip_health_score: number;
  route_summary: string[];
}

export const demoTrip: Trip = {
  id: 'trip_001',
  name: 'Manali Adventure',
  destination: 'Manali, Himachal Pradesh',
  start_date: '2026-09-12',
  end_date: '2026-09-17',
  traveler_count: 2,
  budget_ceiling: 5000,
  recovery_strategy: 'best_overall',
  status: 'ACTIVE',
  trip_health_score: 92,
  route_summary: ['Pune', 'New Delhi', 'Chandigarh', 'Manali'],
};

export const demoBookings: Booking[] = [
  {
    id: 'bk_1',
    trip_id: 'trip_001',
    type: 'FLIGHT',
    title: 'Pune to New Delhi',
    code: '6E-1234',
    provider: 'IndiGo Airlines',
    operator: 'Airbus A320neo',
    origin: 'Pune (PNQ)',
    destination: 'New Delhi (DEL)',
    origin_hub: 'PNQ Terminal 1',
    dest_hub: 'DEL Terminal 2',
    start_time: '2026-09-12T10:00:00',
    end_time: '2026-09-12T12:00:00',
    cost: 8400,
    status: 'CONFIRMED',
    is_important: false,
    details: ['Seat 14A, 14B', 'Gate 04', '2 Checked Bags (30kg)', 'On-time Reliability: 94%'],
    buffer_to_next: '30 mins Airport Exit & Cab Buffer • Safe',
  },
  {
    id: 'bk_2',
    trip_id: 'trip_001',
    type: 'TRANSFER',
    title: 'Airport to City Hotel Cab',
    code: 'UB-5678',
    provider: 'Uber Premier',
    operator: 'Toyota Innova Crysta',
    origin: 'DEL Airport T2',
    destination: 'Connaught Place',
    origin_hub: 'Pickup Pillar 12',
    dest_hub: 'The Imperial Hotel Gate',
    start_time: '2026-09-12T12:30:00',
    end_time: '2026-09-12T13:30:00',
    cost: 1100,
    status: 'CONFIRMED',
    is_important: false,
    details: ['Pre-booked & Guaranteed', 'Driver Dispatched 45m Prior', 'Tolls Included'],
    buffer_to_next: '30 mins Hotel Check-in Buffer • Safe',
  },
  {
    id: 'bk_3',
    trip_id: 'trip_001',
    type: 'HOTEL',
    title: 'The Imperial, New Delhi',
    code: 'IMP-9012',
    provider: 'Heritage Luxury Suites',
    operator: 'Heritage Room (King Bed)',
    origin: 'New Delhi',
    destination: 'New Delhi',
    origin_hub: 'Janpath, Connaught Place',
    dest_hub: 'Early Checkout: 04:00 PM',
    start_time: '2026-09-12T14:00:00',
    end_time: '2026-09-12T16:00:00',
    cost: 6500,
    status: 'CONFIRMED',
    is_important: true,
    details: ['Day-use Freshen Up Stay', '2 Guests Included', 'Luggage Concierge Storage'],
    buffer_to_next: '1 hour Station Transit Buffer • Safe',
  },
  {
    id: 'bk_4',
    trip_id: 'trip_001',
    type: 'TRAIN',
    title: 'Delhi to Chandigarh Shatabdi',
    code: '12005',
    provider: 'Indian Railways (IRCTC)',
    operator: 'Kalka Shatabdi Express',
    origin: 'New Delhi (NDLS)',
    destination: 'Chandigarh (CDG)',
    origin_hub: 'NDLS Platform 1',
    dest_hub: 'CDG Junction Platform 2',
    start_time: '2026-09-12T17:00:00',
    end_time: '2026-09-12T20:30:00',
    cost: 2400,
    status: 'CONFIRMED',
    is_important: false,
    details: ['Executive Class (Coach C1: 12, 14)', 'Evening Dinner Service Included', 'High Punctuality'],
    buffer_to_next: '2h 30m Dinner & Bus Stand Buffer • Safe',
  },
  {
    id: 'bk_5',
    trip_id: 'trip_001',
    type: 'TRANSFER',
    title: 'Chandigarh to Manali Volvo',
    code: 'HP-VOL-44',
    provider: 'HPTDC Super Luxury Volvo',
    operator: 'Multi-Axle AC Sleeper',
    origin: 'Chandigarh ISBT',
    destination: 'Manali Stand',
    origin_hub: 'Sector 43 Bay 6',
    dest_hub: 'Private Bus Stand, Manali',
    start_time: '2026-09-12T23:00:00',
    end_time: '2026-09-13T07:00:00',
    cost: 3200,
    status: 'CONFIRMED',
    is_important: false,
    details: ['Lower Berths 9, 10', 'Overnight Mountain Route', 'Blankets & Water Provided'],
    buffer_to_next: '3 hours Morning Freshen-up Buffer • Safe',
  },
  {
    id: 'bk_6',
    trip_id: 'trip_001',
    type: 'ACTIVITY',
    title: 'Solang Valley Paragliding & Trek',
    code: 'HA-2345',
    provider: 'Himalayan Adventures Club',
    operator: 'Certified High-Altitude Tandem',
    origin: 'Solang Valley',
    destination: 'Solang Valley',
    originHub: 'Base Camp Office',
    dest_hub: 'Solang Valley Landing Point',
    start_time: '2026-09-13T10:00:00',
    end_time: '2026-09-13T14:00:00',
    cost: 4500,
    status: 'CONFIRMED',
    is_important: true,
    details: ['GoPro 4K Flight Footage', 'Certified Tandem Pilot', 'Strict 10:00 AM Slot Required'],
    buffer_to_next: undefined,
  } as any,
];

// Disruption Data (Simulated 5-hour Flight Delay)
export const demoDisruption = {
  id: 'dis_001',
  trip_id: 'trip_001',
  booking_id: 'bk_1',
  type: 'DELAY',
  title: 'Flight 6E-1234 Delayed by 5 Hours',
  original_arrival: '12:00 PM',
  new_arrival: '05:00 PM',
  delay_minutes: 300,
  reason: 'Technical maintenance & airspace congestion at Mumbai ATC',
  affected_nodes_count: 5,
};

// Ripple Impact Results
export const demoImpactNodes = [
  {
    booking_id: 'bk_1',
    title: 'Pune → Delhi Flight',
    type: 'FLIGHT',
    severity: 'DISRUPTED',
    slack_minutes: -300,
    reason: 'Initial delay of 300 minutes. Arrival delayed from 12:00 PM to 5:00 PM.',
    action_required: 'Carrier notification received',
  },
  {
    booking_id: 'bk_2',
    title: 'Airport Transfer Cab',
    type: 'TRANSFER',
    severity: 'CRITICAL',
    slack_minutes: -270,
    reason: 'Cab scheduled for 12:30 PM departure missed. Flight only lands at 5:00 PM.',
    action_required: 'Must rebook pickup for 5:30 PM or cancel without penalty',
  },
  {
    booking_id: 'bk_3',
    title: 'Hotel The Imperial Stay',
    type: 'HOTEL',
    severity: 'AT_RISK',
    slack_minutes: -60,
    reason: '4-hour day stay reduced to under 30 minutes due to 5:30 PM arrival.',
    action_required: 'Notify hotel for late baggage check-in',
  },
  {
    booking_id: 'bk_4',
    title: 'Delhi → Chandigarh Shatabdi',
    type: 'TRAIN',
    severity: 'CRITICAL',
    slack_minutes: -120,
    reason: 'Departs NDLS at 5:00 PM. Flight arrives at DEL airport at 5:00 PM (impossible transit).',
    action_required: 'Missed train connection. Full reroute needed.',
  },
  {
    booking_id: 'bk_5',
    title: 'Chandigarh → Manali Volvo',
    type: 'TRANSFER',
    severity: 'CRITICAL',
    slack_minutes: -30,
    reason: 'Downstream miss: Without the 5:00 PM train, you cannot reach Chandigarh by 11:00 PM.',
    action_required: 'Missed overnight departure.',
  },
  {
    booking_id: 'bk_6',
    title: 'Solang Valley Paragliding',
    type: 'ACTIVITY',
    severity: 'AT_RISK',
    slack_minutes: 0,
    reason: 'Morning 10:00 AM slot cannot be honored if arrival into Manali is pushed past noon.',
    action_required: 'Reschedule slot to afternoon or next morning',
  },
];

// Recovery Plans
export const demoRecoveryPlans = [
  {
    id: 'plan_best',
    type: 'BEST_OVERALL',
    badge: 'Recommended by AI',
    title: 'Evening Vande Bharat & Direct Cab',
    additional_cost: 2100,
    time_impact_hours: 1.2,
    itinerary_preserved_pct: 94,
    bookings_changed_count: 2,
    convenience_score: 4.8,
    hotel_preserved: true,
    activity_preserved: true,
    rationale:
      'Recommended because it saves 100% of your hotel stay and paragliding slot, while adding only ₹2,100 by rebooking the 07:15 PM Vande Bharat train to Chandigarh with a private mountain cab directly to Solang Valley.',
    changes: [
      {
        original: 'Delhi → Chandigarh Shatabdi (05:00 PM)',
        replacement: 'Delhi → Chandigarh Vande Bharat (07:15 PM - 10:45 PM)',
        cost_diff: '+₹900',
        action: 'Rebook',
      },
      {
        original: 'Chandigarh → Manali Volvo (11:00 PM)',
        replacement: 'Chandigarh → Manali Private Cab (11:00 PM - 06:30 AM)',
        cost_diff: '+₹1,200',
        action: 'Rebook',
      },
    ],
    preserved_items: [
      'The Imperial Hotel Day-use Preserved',
      'Solang Valley 10:00 AM Paragliding Slot Guaranteed',
      'Arrive in Manali with 3.5h rest before activity',
    ],
  },
  {
    id: 'plan_cheapest',
    type: 'CHEAPEST',
    badge: 'Lowest Added Cost',
    title: 'Overnight Sleeper Bus from Delhi',
    additional_cost: 850,
    time_impact_hours: 4.5,
    itinerary_preserved_pct: 76,
    bookings_changed_count: 3,
    convenience_score: 3.2,
    hotel_preserved: false,
    activity_preserved: false,
    rationale:
      'Cancels train and hotel stay in Delhi. Takes a direct 10:00 PM overnight bus from Majnu Ka Tila directly to Manali. Cost impact is minimal (+₹850), but delays arrival to 11:30 AM, forfeiting morning paragliding.',
    changes: [
      {
        original: 'Hotel The Imperial + Shatabdi Train',
        replacement: 'Direct Delhi → Manali Sleeper Bus (10:00 PM)',
        cost_diff: '-₹1,400',
        action: 'Cancelled & Replaced',
      },
      {
        original: 'Solang Valley Paragliding (10:00 AM)',
        replacement: 'Cancelled (Refund Claim Initiated)',
        cost_diff: '+₹2,250 refund',
        action: 'Cancelled',
      },
    ],
    preserved_items: [
      'Minimal out-of-pocket cash required',
      'Direct connection with zero layovers',
    ],
  },
  {
    id: 'plan_fastest',
    type: 'FASTEST',
    badge: 'Fastest Transit',
    title: 'Direct Connecting Flight to Kullu (Bhuntar)',
    additional_cost: 4600,
    time_impact_hours: 0,
    itinerary_preserved_pct: 100,
    bookings_changed_count: 2,
    convenience_score: 5.0,
    hotel_preserved: true,
    activity_preserved: true,
    rationale:
      'Zero arrival delay. Rebooks a connecting flight from Delhi (DEL) to Kullu-Manali (KUU) the next morning at 06:40 AM. Arrives in Manali at 08:00 AM, beating the original road schedule with maximum comfort.',
    changes: [
      {
        original: 'Shatabdi Train + Overnight Volvo',
        replacement: 'Alliance Air DEL → KUU Flight (06:40 AM - 08:00 AM)',
        cost_diff: '+₹4,600',
        action: 'Rebook',
      },
    ],
    preserved_items: [
      'Zero lost vacation hours',
      '100% of itinerary and activities preserved',
      'Overnight rest in 5-star airport hotel',
    ],
  },
];
