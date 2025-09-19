import sys
import json
import plotly.graph_objects as go
from datetime import datetime

# The function now accepts the full data object
def generate_graph_data(data):
    # Access the relevant data from the full dictionary
    candlestick_data = data.get("candlestickData", [])
    coin_symbol = data.get("coin", {}).get("symbol", "")

    # Convert Unix timestamps to human-readable strings
    times = [datetime.fromtimestamp(item['time']).strftime('%Y-%m-%d %H:%M:%S') for item in candlestick_data]
    prices = [item['close'] for item in candlestick_data]
    
    # Create a scatter plot trace for the line graph
    trace = go.Scatter(
        x=times,
        y=prices,
        mode='lines',
        name='Price'
    )

    # Define the graph layout with the corrected title
    layout = {
        'title': '*' + coin_symbol + ' Price Chart',
        'xaxis': {'title': 'Time'},
        'yaxis': {'title': 'Price'},
        'paper_bgcolor': 'rgba(0,0,0,0)',
        'plot_bgcolor': 'rgba(0,0,0,0)'
    }

    # Create the figure object and return it as a JSON string
    fig = go.Figure(data=[trace], layout=layout)
    return json.dumps(fig.to_json())

if __name__ == '__main__':
    # Read the raw JSON string from standard input
    raw_data = sys.stdin.read()
    data = json.loads(raw_data)
    
    # Pass the full data dictionary to the function
    graph_json = generate_graph_data(data)
    print(graph_json)