import pandas as pd
import json


def read_scatter():
    with open("test/data/scatterplot.csv") as f:
        print(f)
        df = pd.read_csv(f)
    # return df.to_json()
    return df.to_csv()


def read_chord_data():
    with open('test/data/test25.json') as f:
        data = json.load(f)
    return data
