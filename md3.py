#!/usr/bin/env
#from __future__ import print_function

import numpy, csv, numbers, ast, json
from sklearn import manifold, datasets
from sklearn.decomposition import PCA, NMF, FastICA, FactorAnalysis
# scikits-learn
# dimension reduction
# iris data set
# car data set - syntagmatic.github.io/parallel-coordinates
# drag select

# matplotlib
# seaborn
# create test 2d array
"""
test_data = []
test_data.append(["letter", "frequency", "milage"])
test_data.append(["A", 4, 1])
test_data.append(["B", 5, 2])
test_data.append(["C", 4, 3])
"""

# Get data from csv
letter_data = []
letter_label = ""
with open('cars.csv', 'rb') as csvfile:
	data_read = csv.reader(csvfile, delimiter=',')
	for row in data_read:
		for i in range(1, len(row)):
			try:
				row[i] = ast.literal_eval(row[i])
			except:
				if row[i] == '':
					row[i] = 0
				pass
		letter_data.append(row)

letter_data[0] = ["md3_id"] + letter_data[0]
for i in range(1, len(letter_data)):
	letter_data[i] = ["row_"+str(i)] + letter_data[i]

with open('md3_data.csv', 'wb') as fixed_file:
	fixed_writer = csv.writer(fixed_file, delimiter=',')
	for r in letter_data:
		fixed_writer.writerow(r)

# Some useful functions
def strip_labels(data):
	ret_data = []
	for row in data[2:]:
		ret_data.append(row[2:])
	return ret_data

def add_labels(coords, original):
	combined = []
	for i in range(0, len(coords)):
		combined.append({"label":original[i+1][0], "pretty_label":original[i+1][1],
											"x":coords[i,0], "y":coords[i,1]})
	return combined


# Scikit learn
dimensions = 2
X = numpy.array(strip_labels(letter_data))

numpy.set_printoptions(threshold=numpy.nan)
#print X

# MDS
mds = manifold.MDS(n_components = dimensions, max_iter=100, n_init=1)
mds_out = mds.fit_transform(X)

# PCA
pca = PCA(n_components = dimensions)
pca_out = pca.fit(X).transform(X)

# NMF
nmf = NMF(n_components = dimensions, tol=5e-3)
nmf_out = nmf.fit(X).transform(X)

# ICA
ica = FastICA(n_components = dimensions)
ica_out = ica.fit(X).transform(X)

# FA
fa = FactorAnalysis(n_components = dimensions)
fa_out = fa.fit(X).transform(X)

# T-SNE
tsne = manifold.TSNE(n_components = dimensions)
tsne_out = tsne.fit_transform(X)



# names need to be unique (pretty names don't)
to_file = [{"name": "mds", "p_name":"MDS", "data": add_labels(mds_out, letter_data)},
			{"name": "pca", "p_name":"PCA", "data": add_labels(pca_out, letter_data)},
			{"name": "nmf", "p_name":"NMF", "data": add_labels(nmf_out, letter_data)},
			{"name": "ica", "p_name":"Fast ICA", "data": add_labels(ica_out, letter_data)},
			{"name": "fa", "p_name":"Factor Analysis", "data": add_labels(fa_out, letter_data)},
			{"name": "tsne", "p_name":"T-SNE", "data": add_labels(tsne_out, letter_data)}]

# create json file
json_file = open('main/data.json', 'w+')
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


