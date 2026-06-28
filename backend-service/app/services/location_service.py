from app.schemas.location import Location

def process_location(location: Location):
  print()
  print("===New Location===")
  print(location)
  print("========")
  return {
    "message" : "Location received successfully"
  }


