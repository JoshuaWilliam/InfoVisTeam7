from flask import Flask, request, session, g, redirect, url_for, abort, \
    render_template, flash, send_file
import pandas as pd
import data
from io import BytesIO

app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('home.html')


@app.route('/chord')
def render_chord():
    return render_template('chord.html')


@app.route('/scatter')
def render_scatter():
    return render_template('scatter.html')


@app.route('/chord_data', methods=['GET'])
def get_chord_data():
    chord_data = data.read_chord_data()
    return chord_data


@app.route('/scatter_data', methods=['GET'])
def get_scatter_data():
    scatter_data = data.read_scatter()
    # return scatter_data
    response_stream = BytesIO(scatter_data.encode())
    return send_file(
        response_stream,
        mimetype="text/csv",
        attachment_filename="scatterplot.csv",
    )


@app.route('/bar_data', methods=['GET'])
def get_bar_data():
    print('TESTINGSSS')
    bar_data = data.read_bar_data()
    # return scatter_data
    response_stream = BytesIO(bar_data.encode())
    return send_file(
        response_stream,
        mimetype="text/csv",
        attachment_filename="averages.csv",
    )


if __name__ == '__main__':
    app.run()
