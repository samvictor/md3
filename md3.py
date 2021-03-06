#!/usr/bin/env
#from __future__ import print_function

import numpy, csv, numbers, ast, json, sys
from sklearn import manifold, datasets, preprocessing
from sklearn.decomposition import PCA, NMF, FastICA, FactorAnalysis

# iris data set
# drag select

# matplotlib
# seaborn
# create test 2d array

# TODO set pretty label to row id if has labels is false

# Get data from csv
letter_data = []
letter_label = ""
if len(sys.argv) > 1:
    in_file = sys.argv[1]
else:
    in_file = "cars.csv"
    
pretty_label_index = 1

# for over 50k
#pretty_label_index = 0

# for wine
pretty_label_index = 1


min_row = 0
max_row = 30000000

row_count = 0

with open(in_file, 'rb') as csvfile:
    data_read = csv.reader(csvfile, delimiter=',')
    for row in data_read:
        if row_count < min_row:
            row_count += 1
            continue
        #if row_count > max_row:
        #    break
        row_count += 1
            
        for i in range(1, len(row)):
            try:
                row[i] = ast.literal_eval(row[i])
            except:
                if row[i] == '':
                    row[i] = 0
                pass
        letter_data.append(row)

# Some useful functions
def strip_labels(data):
    ret_data = []
    for row in data[1:]:
        ret_data.append(row[1:pretty_label_index] + row[pretty_label_index+1:])
    return ret_data

# for car data
def add_labels(coords, original):
    combined = []
    for i in range(0, len(coords)):
        combined.append({"label":original[i+1][0], "pretty_label":original[i+1][pretty_label_index],
                                            "x":coords[i,0], "y":coords[i,1]})
    return combined


# Scikit learn
dimensions = 2
X = numpy.array(strip_labels(letter_data))


"""
# S curve
from sklearn import manifold, datasets

n_points = 1000
#X, color = datasets.samples_generator.make_swiss_roll(n_points, random_state=0)
X, color = datasets.samples_generator.make_s_curve(n_points, random_state=0)

#for i in range(0, len(X)):
#    X[i][0] *= 1000
#print X

def add_labels (coords, original):
    combined = []
    for i in range(0, len(coords)):
        combined.append({"label": "row_"+str(i), "pretty_label": str(i),
                                            "x":coords[i,0], "y":coords[i,1]})
    return combined

def add_labels2 (coords):
    combined = []
    for i in range(0, len(coords)):
        combined.append({"label": "row_"+str(i), "pretty_label": str(i),
                                            "x":coords[i,0], "y":coords[i,1], "z":coords[i,2]})
    return combined

def make_csv(sphere_data):    
    sphere_data = add_labels2(sphere_data)
    with open('sphere_data.csv', 'wb+') as sphere_file:
        sphere_writer = csv.writer(sphere_file, delimiter=',')
        
        sphere_writer.writerow(['md3_id', 'name', 'x', 'y', 'z'])
        
        amount = 398.0
        data_size = 0.0
        data_size = len(sphere_data)
        step = 0.0
        step = data_size/amount
        print len(sphere_data)
        count = 0
        
        for i in range(0, int(len(sphere_data)/step)):
            r = sphere_data[i*int(step)]
            sphere_writer.writerow([r['label'], r['pretty_label'], r['x'], r['y'], r['z']])
            count += 1
        
        print count

make_csv(X)
"""
"""
# sphere
from sklearn.utils import check_random_state

n_samples = 1000

random_state = check_random_state(0)
p = random_state.rand(n_samples) * (2 * numpy.pi - 0.55)
t = random_state.rand(n_samples) * numpy.pi

indices = ((t < (numpy.pi - (numpy.pi / 8))) & (t > ((numpy.pi / 8))))
colors = p[indices]

sp_x, sp_y, sp_z = numpy.sin(t[indices]) * numpy.cos(p[indices]), \
    numpy.sin(t[indices]) * numpy.sin(p[indices]), \
    numpy.cos(t[indices])    

X = numpy.array([sp_x, sp_y, sp_z]).T
#print X
"""

# normalize data

numpy.set_printoptions(threshold=numpy.nan)
X = numpy.transpose(X)

range_scaler = preprocessing.MinMaxScaler()

for i in range(0, len(X)):
    X[i] = range_scaler.fit_transform(X[i])


X = numpy.transpose(X)

print "Starting MDS..."
# MDS
mds = manifold.MDS(n_components = dimensions, max_iter=100, n_init=1)
mds_out = mds.fit_transform(X)
print "Finished MDS"

# PCA
pca = PCA(n_components = dimensions)
pca_out = pca.fit(X).transform(X)
print "Finished PCA"

# NMF
nmf = NMF(n_components = dimensions, tol=5e-3)
nmf_out = nmf.fit(X).transform(X)
print "Finished NMF"

# ICA
ica = FastICA(n_components = dimensions)
ica_out = ica.fit(X).transform(X)
print "Finished ICA"

# FA
fa = FactorAnalysis(n_components = dimensions)
fa_out = fa.fit(X).transform(X)
print "Finished FA"

# T-SNE
tsne = manifold.TSNE(n_components = dimensions)
tsne_out = tsne.fit_transform(X)
print "Finished T-SNE"


# names need to be unique (pretty names don't)
to_file = [{"name": "mds", "p_name":"MDS", "data": add_labels(mds_out, letter_data)},
            {"name": "pca", "p_name":"PCA", "data": add_labels(pca_out, letter_data)},
            {"name": "nmf", "p_name":"NMF", "data": add_labels(nmf_out, letter_data)},
            {"name": "ica", "p_name":"Fast ICA", "data": add_labels(ica_out, letter_data)},
            {"name": "fa", "p_name":"Factor Analysis", "data": add_labels(fa_out, letter_data)},
            {"name": "tsne", "p_name":"T-SNE", "data": add_labels(tsne_out, letter_data)}]

# create json file
json_file = open(in_file.split('.')[0]+'_coords.json', 'w+')
json.dump(to_file, fp=json_file)
json_file.close()


"""
# start server
import SimpleHTTPServer
import SocketServer

PORT = 8888
HOST = ""
Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
httpd = SocketServer.TCPServer((HOST, PORT), Handler)

print "serving at port", PORT
httpd.serve_forever()
"""


