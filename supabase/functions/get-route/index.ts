import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { start, end } = await req.json()
    const API_KEY = Deno.env.get('ORS_API_KEY')

    if (!API_KEY) throw new Error('API Key missing')

    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [[start[1], start[0]], [end[1], end[0]]] // Flip to [Lng, Lat]
        })
      }
    )

    if (!response.ok) throw new Error("Routing provider error")

    const data = await response.json()
    
    // 1. Get Geometry (The Line)
    const coordinates = data.features[0].geometry.coordinates.map(
      (coord: number[]) => [coord[1], coord[0]] // Flip back to [Lat, Lng]
    )

    // 2. Get Summary (The ETA and Distance)
    const summary = data.features[0].properties.summary; // { distance: 1200, duration: 300 }

    return new Response(JSON.stringify({ path: coordinates, summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})